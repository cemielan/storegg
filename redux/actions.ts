import { Product } from '../App';

export const addToMyProducts = (item: Product) => ({
  type: 'ADD_TO_MY_PRODUCTS' as const,
  payload: item,
});

export const removeFromMyProducts = (itemId: number) => ({
  type: 'REMOVE_FROM_MY_PRODUCTS' as const,
  payload: itemId,
});
