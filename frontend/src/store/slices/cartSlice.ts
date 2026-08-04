import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrls: string[];
  moq: number;
  supplier: {
    id: string;
    businessName: string;
  };
}

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.error = null;
    },
    addCartItem(state, action: PayloadAction<CartItem>) {
      const existingIdx = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingIdx !== -1) {
        state.items[existingIdx] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartItemQty(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeCartItemFromState(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCartState(state) {
      state.items = [];
      state.error = null;
    },
    setCartError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setCartLoading,
  setCartItems,
  addCartItem,
  updateCartItemQty,
  removeCartItemFromState,
  clearCartState,
  setCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
