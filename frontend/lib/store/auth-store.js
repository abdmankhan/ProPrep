import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";
import { config } from "@/lib/config";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      set({ user: res.data.user });
      toast.success("Welcome back! Login successful");
      return res.data; // Return data for console logging in component
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      set({ user: res.data.user });
      toast.success("Account created successfully! Welcome aboard!");
      return res.data; // Return data for console logging in component
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create account. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  googleLogin: async (accessToken) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/auth/google`,
        { accessToken },
        { withCredentials: true } 
      );
      set({ user: res.data.user });
      toast.success("Welcome! Google login successful");
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Google login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(
        `${config.apiUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      set({ user: null });
      toast.success("Logged out successfully. See you soon!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to logout. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("Password reset instructions sent to your email");
      return res.data; // Return data for console logging in component
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/auth/reset-password`,
        { token, password },
        { withCredentials: true }
      );
      toast.success(
        "Password reset successful! You can now login with your new password"
      );
      return res.data; // Return data for console logging in component
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${config.apiUrl}/api/auth/getProfile`, {
        withCredentials: true,
      });
      // console.log(res.data);
      set({ user: res.data });
      return res.data; // Return data for console logging in component
    } catch (error) {
      set({ user: null });
      // Don't show toast for fetchUser as it's used for session checks
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
