"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile, UserRole } from "@/types";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The Single Admin Definition
export const SINGLE_ADMIN_PROFILE: UserProfile = {
  id: "u-admin-shreefood-001",
  full_name: "श्री फूड Admin",
  role: "admin",
  email: "admin@shreefood.com",
  phone: "+91 92843 66544",
  address: "श्री फूड Cloud Kitchen Facility",
  created_at: "2026-01-01T00:00:00.000Z",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } catch {
      // In offline/mock mode
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const isPlaceholder =
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

        if (isPlaceholder) {
          setIsMockMode(true);
          const savedUser =
            typeof window !== "undefined"
              ? localStorage.getItem("sf_current_user") || localStorage.getItem("ck_mock_user")
              : null;

          if (savedUser) {
            try {
              const parsed: UserProfile = JSON.parse(savedUser);
              if (mounted) {
                setProfile(parsed);
                setUser({
                  id: parsed.id,
                  email: parsed.email || (parsed.role === "admin" ? "admin@shreefood.com" : "customer@shreefood.com"),
                  app_metadata: {},
                  user_metadata: {
                    full_name: parsed.full_name,
                    phone: parsed.phone,
                    address: parsed.address,
                  },
                  aud: "authenticated",
                  created_at: parsed.created_at,
                } as User);
              }
            } catch {
              // Ignore corrupted storage
            }
          }
          if (mounted) setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn("Auth initialization fallback:", err);
        setIsMockMode(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (!isMockMode) {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, isMockMode, supabase]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || "Failed to log in" };
      }

      const activeProfile: UserProfile = {
        id: data.user.id,
        full_name: data.user.full_name,
        role: data.user.role || "customer",
        email: data.user.email,
        phone: data.user.phone || null,
        address: data.user.address || null,
        created_at: data.user.created_at || new Date().toISOString(),
      };

      setProfile(activeProfile);
      setUser({
        id: activeProfile.id,
        email: data.user.email,
        app_metadata: {},
        user_metadata: {
          full_name: activeProfile.full_name,
          phone: activeProfile.phone,
          address: activeProfile.address,
        },
        aud: "authenticated",
        created_at: activeProfile.created_at,
      } as User);

      if (typeof window !== "undefined") {
        localStorage.setItem("sf_current_user", JSON.stringify(activeProfile));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      return { success: false, error: msg };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          password,
          confirmPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || "Registration failed" };
      }

      const registeredCustomer: UserProfile = {
        id: data.customer.id,
        full_name: data.customer.name,
        role: "customer",
        email: data.customer.email,
        phone: data.customer.phone,
        address: data.customer.address,
        created_at: data.customer.created_at,
      };

      setProfile(registeredCustomer);
      setUser({
        id: registeredCustomer.id,
        email: registeredCustomer.email || email,
        app_metadata: {},
        user_metadata: {
          full_name: registeredCustomer.full_name,
          phone: registeredCustomer.phone,
          address: registeredCustomer.address,
        },
        aud: "authenticated",
        created_at: registeredCustomer.created_at,
      } as User);

      if (typeof window !== "undefined") {
        localStorage.setItem("sf_current_user", JSON.stringify(registeredCustomer));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to register";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (!isMockMode) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setProfile(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("sf_current_user");
        localStorage.removeItem("ck_mock_user");
      }
      setIsLoading(false);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    if (role === "admin") {
      setProfile(SINGLE_ADMIN_PROFILE);
      setUser({
        id: SINGLE_ADMIN_PROFILE.id,
        email: SINGLE_ADMIN_PROFILE.email || "admin@shreefood.com",
        app_metadata: {},
        user_metadata: { full_name: SINGLE_ADMIN_PROFILE.full_name },
        aud: "authenticated",
        created_at: SINGLE_ADMIN_PROFILE.created_at,
      } as User);

      if (typeof window !== "undefined") {
        localStorage.setItem("sf_current_user", JSON.stringify(SINGLE_ADMIN_PROFILE));
      }
    } else {
      logout();
    }
  };

  const role: UserRole = profile?.role || "customer";
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        isMockMode,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
