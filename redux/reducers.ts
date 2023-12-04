import { Product } from '../App';

type AppState = {
  myPurchasedItems: Product[];
};

const initialState: AppState = {
  myPurchasedItems: [],
};

type Action =
  | { type: 'ADD_TO_MY_PRODUCTS'; payload: Product }
  | { type: 'REMOVE_FROM_MY_PRODUCTS'; payload: number };

const rootReducer = (state: AppState = initialState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TO_MY_PRODUCTS':
      return {
        ...state,
        myPurchasedItems: [...state.myPurchasedItems, action.payload],
      };
    case 'REMOVE_FROM_MY_PRODUCTS':
      return {
        ...state,
        myPurchasedItems: state.myPurchasedItems.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
};

export default rootReducer;
