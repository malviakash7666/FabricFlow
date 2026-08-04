import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "supplier";
}

interface AuthState {
  token: string | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  profile: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; user: User | null }>
    ) {
      const { accessToken, user } = action.payload;
      state.token = accessToken;
      state.user = user;
      state.error = null;
    },
    setProfile(state, action: PayloadAction<any>) {
      state.profile = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.profile = null;
      state.error = null;
    },
  },
});

export const { setLoading, setCredentials, setProfile, setError, logout } =
  authSlice.actions;

export default authSlice.reducer;
