import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const MiniGame: React.FC<{ onGachaComplete: (coins: number) => void }> = ({ onGachaComplete }) => {
  const [eggBroken, setEggBroken] = useState(false);
  const [gachaResult, setGachaResult] = useState<{
    type: 'gold' | 'silver' | 'bronze';
    value: number;
  } | null>(null);

  const handleGachaPress = () => {
    if (!eggBroken) {
      const randomPrize = Math.random();

      let prizeType: 'bronze' | 'silver' | 'gold' = 'bronze';
      let prizeValue = 20;

      if (randomPrize > 0.8) {
        prizeType = 'gold';
        prizeValue = 100;
      } else if (randomPrize > 0.4) {
        prizeType = 'silver';
        prizeValue = 50;
      }
      
      onGachaComplete(prizeValue);

      // Gacha result
      setGachaResult({ type: prizeType, value: prizeValue });
      setEggBroken(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.CoinInfoContainer}>
        <Image source={require('./assets/gold-coin.png')} style={styles.coinInfo} />
        <Text style={styles.coinValueText}>100</Text>
        <Image source={require('./assets/silver-coin.png')} style={styles.coinInfo} />
        <Text style={styles.coinValueText}>50</Text>
        <Image source={require('./assets/bronze-coin.png')} style={styles.coinInfo} />
        <Text style={styles.coinValueText}>20</Text>
      </View>

      {!eggBroken ? (
        <TouchableOpacity onPress={handleGachaPress}>
          <Text style={styles.clickText}>Click on the egg to get your prize!</Text>
          <Image source={require('./assets/egg-full.png')} style={styles.eggImage} />
        </TouchableOpacity>
      ) : (
        <View style={styles.gachaResultContainer}>
          <Text style={styles.congratulationText}>Congratulations!</Text>
          <Text style={styles.resultText}>You got a {gachaResult?.type} Coin!</Text>
          <Image
            source={
              gachaResult?.type === 'bronze'
                ? require('./assets/bronze-coin.png')
                : gachaResult?.type === 'silver'
                ? require('./assets/silver-coin.png')
                : require('./assets/gold-coin.png')
            }
            style={styles.coinImage}
          />
          <Image source={require('./assets/egg-broken.png')} style={styles.eggImage} />
          <Text style={styles.coinsAddedText}>
            {gachaResult?.value} coins have been added to your balance
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  CoinInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    padding: 10,
  },
  coinInfo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginHorizontal: 8,
  },
  coinValueText: {
    fontSize: 18,
    color: 'black',

  },
  clickText: {
    fontSize: 25,
    width: 320,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    alignSelf: 'center',
  },
  eggImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  gachaResultContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  congratulationText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
    marginTop: 15,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 20,
  },
  coinImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  coinsAddedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
    width: 280,
    textAlign: 'center',
  },
});

export default MiniGame;