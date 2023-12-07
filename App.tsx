import React, { useState, useEffect } from 'react';
import { useLayoutEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { Modal, Pressable } from 'react-native';
import SearchIcon from './SearchIcon';
import GridViewIcon from './GridViewIcon';
import ListViewIcon from './ListViewIcon';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import Mini Game
import MiniGame from './MiniGame';

// Import for Exit Modal
import { BackHandler, Alert, AppState, Platform } from 'react-native';

// Import for Redux-Persist
import { store, persistor } from './redux/store';
import { addToMyProducts, removeFromMyProducts } from './redux/actions';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';


export type Product = {
  id: number;
  title: string;
  image: string;
  price: number;
  description: string;
};

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  setOptions: (options: { title: string }) => void;
};

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [myCoins, setMyCoins] = useState(500);
  const [myPurchasedItems, setMyPurchasedItems] = useState<Product[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Show modal before user exit application
  useEffect(() => {
    const handleBackPress = () => {
      Alert.alert('Exit Storegg?', 'Are you sure want to close Storegg?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Exit',
          onPress: () => Platform.OS === 'android' ? BackHandler.exitApp() : undefined,
        },
      ]);
      return true;
    };

    const backHandler = Platform.OS === 'android'
      ? BackHandler.addEventListener('hardwareBackPress', handleBackPress)
      : undefined;

    return () => {
      if (Platform.OS === 'android' && backHandler) {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      }
    };
  }, []);

  // Handle gacha and add gacha prize when completed
  const handleGachaComplete = (prizeValue: number) => {
    setMyCoins((prevCoins) => prevCoins + prizeValue);
  };

  // Add navigation state and functions
  const [navigation, setNavigation] = useState<any>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
    
        if (Array.isArray(data)) {
          setProducts((prevProducts: Product[]) => [...prevProducts, ...data]);
        } else {
          console.error('Invalid data format:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  // Toggle Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };  

  // Toggle view mode (list or grid view)
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'list' ? 'grid' : 'list'));
  };

  // Navigate to MyProduct screen and pass the purchased item as a parameter
  const navigateToMyProduct = (purchasedItem: Product) => {
    navigation.navigate('MyProduct', { purchasedItem });
  };

  // Updated setNavigationRef to accept a navigation reference
  const setNavigationRef = (nav: any) => {
    setNavigation(nav);
  };

  // Navigate to the "ItemDetail" screen with the selected item
  const navigateToItemDetail = (item: Product, isPurchasedItem: boolean = false) => {
    navigation.navigate('ItemDetail', { item, isPurchasedItem });
  };

  // Item detail screen
  const ItemDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
    const { item, isPurchasedItem } = route.params;
  
    useEffect(() => {
      navigation.setOptions({ title: item.title });
    }, [item, navigation]);
  
    const addToMyProduct = () => {
      setMyPurchasedItems((prevItems) => [...prevItems, item]);
      store.dispatch(addToMyProducts(item));
      setMyCoins((prevCoins) => prevCoins - item.price);
    };
  
    const sellItem = (item: Product) => {
      const index = myPurchasedItems.findIndex((purchased) => purchased.id === item.id);
      
      if (index !== -1) {
        // Dispatch the action to remove the item from myPurchasedItems
        store.dispatch(removeFromMyProducts(item.id));
    
        const updatedItems = [...myPurchasedItems];
        updatedItems.splice(index, 1);
        setMyPurchasedItems(updatedItems);
    
        setMyCoins((prevCoins) => prevCoins + item.price);
      }
    };
  
    const handleTransaction = () => {
      if (isPurchasedItem) {
        sellItem(item);
        const updatedCoins = myCoins + item.price; 
        setMyCoins(updatedCoins);
        setModalMessage(`${item.title} was sold successfully! Your current balance is ${updatedCoins.toFixed(0)}.`);
      } else {
        // Handle buy logic here
        addToMyProduct();
        const updatedCoins = myCoins - item.price; 
        setMyCoins(updatedCoins); 
        setModalMessage(`${item.title} was bought successfully! Your current balance is ${updatedCoins.toFixed(0)}.`);
      }
      toggleModal();
    };
  
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.itemDetailContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemInfoContainer}>
            <Text style={styles.itemName}>{item.title}</Text>
            <Text style={styles.itemPriceHeader}>Price</Text>
            <Text style={styles.itemPrice}>{item.price} Coins</Text>
            <Text style={styles.itemDescriptionHeader}>Description</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
  
          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleTransaction}>
            <Text style={styles.buyButtonText}>{isPurchasedItem ? 'Sell' : 'Buy'}</Text>
          </TouchableOpacity>

           {/* Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setModalVisible(!isModalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Success!</Text>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <Pressable style={styles.okButton} onPress={toggleModal}>
                  <Text style={styles.okButtonText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    );
  };
  

  // My product screen
  const MyProductScreen = ({ route, navigation }: { route: any; navigation: any }) => {
    const { purchasedItem } = route.params;
  
    const sellItem = (item: Product) => {
      setMyPurchasedItems((prevItems) => {
        const updatedItems = prevItems.filter((purchased) => purchased.id !== item.id);
        return updatedItems;
      });
    };
  
    const renderMyProductItem = ({ item }: { item: Product }) => (
      <TouchableOpacity key={item.id} onPress={() => navigateToItemDetail(item, true)}>
        <View style={styles.listItem}>
          <View style={styles.productItemContainer}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.title}</Text>
              <Text style={styles.productPrice}>Price: {item.price} Coins</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

    useLayoutEffect(() => {
      navigation.setOptions({
        title: 'My Products',
      });
    }, [navigation]);
  
    return (
      <SafeAreaView style={styles.backgroundStyle}>
        <ScrollView contentContainerStyle={styles.myProductContainer}>
          <Text style={styles.myProductHeader}>Purchased Items</Text>
          {myPurchasedItems.map((item) => renderMyProductItem({ item }))}
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity key={item.id} onPress={() => navigateToItemDetail(item)}>
      <View style={viewMode === 'list' ? styles.listItem : styles.gridItem}>
        <View style={styles.productItemContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {viewMode === 'list' && (
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.title}</Text>
              <Text style={styles.productPrice}>Price: {item.price} Coins</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={setNavigationRef}>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              options={{ headerShown: false }}>
              {(props) => (
                <SafeAreaView style={styles.backgroundStyle}>
                  <StatusBar barStyle="dark-content" />

                  <View style={styles.searchContainer}>
                    <View style={styles.searchBoxContainer}>
                      <SearchIcon style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchBox}
                        placeholder="Search Product ..."
                        value={searchText}
                        onChangeText={(text) => setSearchText(text)}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => navigateToMyProduct(products[0])}
                      style={styles.myProductButton}>
                      <Text style={styles.myProductText}>My Products &gt;</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.myCoinsContainer}>
                  <Text style={styles.myCoinsValue}>{myCoins.toFixed(0)}</Text>
                    <Text style={styles.myCoinsText}>My coins</Text>
                  </View>

                  <View style={styles.bottomContainer}>               
                    <View style={styles.headerContainer}>
                      <Text style={styles.headerText}>Available Products</Text>
                      <TouchableOpacity onPress={toggleViewMode}>
                        <View style={styles.toggleButton}>
                          {viewMode === 'list' ? <ListViewIcon /> : <GridViewIcon />}
                        </View>
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : null}>
                      {products.map((item) => renderProductItem({ item }))}
                    </ScrollView>               
                  </View>

                  <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => navigation.navigate('MiniGame')}
                    activeOpacity={0.7}>
                    <Image source={require('./assets/egg-full.png')} style={styles.fabImage} />
                  </TouchableOpacity>

                </SafeAreaView>
              )}
            </Stack.Screen>

            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="MyProduct" component={MyProductScreen} />
            
            <Stack.Screen name="MiniGame">
              {(props) => <MiniGame onGachaComplete={handleGachaComplete} />}
            </Stack.Screen>
            
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'column',
    padding: 25,
    backgroundColor: '#C3B1E1',
    height: 175,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBox: {
    flex: 1,
    height: 50,
    fontSize: 17,
    borderColor: 'grey',
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  myProductButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    width: '45%',
    marginTop: 15,
  },
  myProductText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold'
  },
  myCoinsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 10,
    marginLeft: 275,
    marginTop: -70,
    zIndex: 1,
    borderRadius: 10,
    width: '30%',
    backgroundColor: 'white',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  myCoinsValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#8A2BE2',
  },
  myCoinsText: {
    fontSize: 16,
    color: 'gray',
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'white',
    marginTop: -30,
    marginBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 25,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 8,
  },
  toggleButton: {
    padding: 5,
    color: '#007BFF',
  },
  listItem: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginTop: -10,
    marginLeft: 20,
  },
  gridItem: {
    flex: 1,
    width: '75%',
    margin: 15,
  },
  productItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    color: 'gray',
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 50,
    padding: 13,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fabImage: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
  },

  // Item Detail Screen/Page Style
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetailContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 60,
    backgroundColor: 'white',
  },
  itemImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  itemInfoContainer: {
    alignItems: 'flex-start',
    marginLeft: -30,
  },
  itemName: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  itemPriceHeader: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: 'black',
    marginBottom: 25,
  },
  itemDescriptionHeader: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 18,
    color: 'black',
  },
  buyButton: {
    backgroundColor: '#8F00FF',
    alignItems: 'center',
    marginTop: 50,
    width: 340,
    padding: 10,
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // My Product Screen/Page Style
  myProductContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  myProductHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  purchasedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  purchasedItemImage: {
    width: 55,
    height: 55,
    resizeMode: 'cover',
    marginRight: 16,
  },
  purchasedItemInfo: {
    flex: 1,
  },
  purchasedItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  purchasedItemPrice: {
    fontSize: 14,
    color: 'gray',
  },
  purchasedItemDescription: {
    fontSize: 12,
    color: 'gray',
  },
  sellButton: {
    backgroundColor: 'red',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  sellButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start',
    margin: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
    color: 'black',
  },
  okButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  okButtonText: {
    color: 'purple',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
