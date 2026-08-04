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
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  profile: localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile")!) : null,
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
      action: PayloadAction<{ accessToken: string; user: User }>
    ) {
      const { accessToken, user } = action.payload;
      state.token = accessToken;
      state.user = user;
      state.error = null;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
    },
    setProfile(state, action: PayloadAction<any>) {
      state.profile = action.payload;
      localStorage.setItem("profile", JSON.stringify(action.payload));
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.profile = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    },
  },
});

export const { setLoading, setCredentials, setProfile, setError, logout } =
  authSlice.actions;

export default authSlice.reducer;
