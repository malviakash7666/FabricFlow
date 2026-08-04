import { useAppDispatch, useAppSelector } from "./storeHooks.ts";
import {
  setCartLoading,
  setCartItems,
  addCartItem,
  updateCartItemQty,
  removeCartItemFromState,
  clearCartState,
  setCartError,
} from "../store/slices/cartSlice.ts";
import { cartService } from "../services/cart.service.ts";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.cart);

  const fetchCart = async () => {
    dispatch(setCartLoading(true));
    try {
      const data = await cartService.getCart();
      dispatch(setCartItems(data.data));
      return data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch cart.";
      dispatch(setCartError(msg));
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const addItemToCart = async (productId: string, quantity: number) => {
    dispatch(setCartLoading(true));
    try {
      const data = await cartService.addToCart(productId, quantity);
      dispatch(addCartItem(data.data));
      return data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to add item to cart.";
      dispatch(setCartError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const updateItemQty = async (cartItemId: string, quantity: number) => {
    dispatch(setCartLoading(true));
    try {
      const data = await cartService.updateCartItem(cartItemId, quantity);
      dispatch(updateCartItemQty({ id: cartItemId, quantity }));
      return data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update quantity.";
      dispatch(setCartError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const removeItem = async (cartItemId: string) => {
    dispatch(setCartLoading(true));
    try {
      await cartService.removeCartItem(cartItemId);
      dispatch(removeCartItemFromState(cartItemId));
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to remove item.";
      dispatch(setCartError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const clearAllCart = async () => {
    dispatch(setCartLoading(true));
    try {
      await cartService.clearCart();
      dispatch(clearCartState());
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to clear cart.";
      dispatch(setCartError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  // Helper selectors
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce(
    (acc, item) => acc + parseFloat(item.product.price as any) * item.quantity,
    0
  );

  return {
    items,
    loading,
    error,
    cartCount,
    cartTotal,
    fetchCart,
    addItemToCart,
    updateItemQty,
    removeItem,
    clearAllCart,
  };
};
