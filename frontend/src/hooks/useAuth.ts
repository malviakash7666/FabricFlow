import { useAppDispatch, useAppSelector } from "./storeHooks.ts";
import {
  setLoading,
  setCredentials,
  setProfile,
  setError,
  logout as logoutAction,
} from "../store/slices/authSlice.ts";
import { authService } from "../services/auth.service.ts";
import { buyerService } from "../services/buyer.service.ts";
import { supplierService } from "../services/supplier.service.ts";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { token, user, profile, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const loginUser = async (credentials: any) => {
    dispatch(setLoading(true));
    try {
      const data = await authService.login(credentials);
      dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      
      // Fetch profile based on role
      try {
        let profileData;
        if (data.user.role === "buyer") {
          profileData = await buyerService.getProfile();
        } else {
          profileData = await supplierService.getProfile();
        }
        dispatch(setProfile(profileData.data));
      } catch (profileErr) {
        // Profile might not exist yet if not onboarded
        dispatch(setProfile(null));
      }
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed.";
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const registerUser = async (registrationData: any) => {
    dispatch(setLoading(true));
    try {
      const data = await authService.register(registrationData);
      dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      dispatch(setProfile(null)); // Profile needs onboarding now
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed.";
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutUser = async () => {
    dispatch(setLoading(true));
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Server logout call failed, clearing local state anyway");
    } finally {
      dispatch(logoutAction());
      dispatch(setLoading(false));
    }
  };

  const loadProfile = async () => {
    if (!token || !user) return null;
    try {
      let profileData;
      if (user.role === "buyer") {
        profileData = await buyerService.getProfile();
      } else {
        profileData = await supplierService.getProfile();
      }
      dispatch(setProfile(profileData.data));
      return profileData.data;
    } catch (err) {
      dispatch(setProfile(null));
      return null;
    }
  };

  const checkSession = async () => {
    dispatch(setLoading(true));
    try {
      const refreshData = await authService.refreshToken();
      const { accessToken } = refreshData;

      dispatch(setCredentials({ accessToken, user: null }));

      const meData = await authService.getMe();
      const { user: userObj } = meData;

      dispatch(setCredentials({ accessToken, user: userObj }));

      let profileData;
      if (userObj.role === "buyer") {
        profileData = await buyerService.getProfile();
      } else {
        profileData = await supplierService.getProfile();
      }
      dispatch(setProfile(profileData.data));
      return userObj;
    } catch (err) {
      dispatch(logoutAction());
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const submitOnboarding = async (onboardingDetails: any) => {
    dispatch(setLoading(true));
    try {
      let profileData;
      if (user?.role === "buyer") {
        profileData = await buyerService.createProfile(onboardingDetails);
      } else {
        profileData = await supplierService.createProfile(onboardingDetails);
      }
      dispatch(setProfile(profileData.data));
      return profileData.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Onboarding failed.";
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProfile = async (profileDetails: any) => {
    dispatch(setLoading(true));
    try {
      let profileData;
      if (user?.role === "buyer") {
        profileData = await buyerService.updateProfile(profileDetails);
      } else {
        profileData = await supplierService.updateProfile(profileDetails);
      }
      dispatch(setProfile(profileData.data));
      return profileData.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Update profile failed.";
      dispatch(setError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    token,
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!token,
    isOnboarded: profile?.isOnboarded || false,
    loginUser,
    registerUser,
    logoutUser,
    loadProfile,
    checkSession,
    submitOnboarding,
    updateProfile,
  };
};
