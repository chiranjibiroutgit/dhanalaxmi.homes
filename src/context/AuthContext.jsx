import { createContext, useContext, useEffect, useState } from "react";

/**
 * Dhanalaxmi Group — Authentication Context
 *
 * Flows:
 *  PUBLIC SITE (sign up only):
 *    - Gmail: create password → sign up
 *    - Phone: OTP via SMS → sign up
 *  SIGN IN PAGE:
 *    - Gmail: Google Auth (uses Gmail's own password via Google, we don't store it)
 *    - Phone: OTP verify → sign in
 *  FORGOT PASSWORD:
 *    - Phone: OTP verify → create new password
 *  PANELS (/devs.panel, /admin.panel, /dev.edit.panel):
 *    - Gmail / Phone login
 *
 * Data is persisted in localStorage and mirrored to database/users.sql structure.
 * Production: swap local simulations for Firebase Auth / real SMS API / backend SQL.
 */
const AuthContext = createContext(null);

const USERS_KEY = "dl_auth_users";
const SESSION_KEY = "dl_auth_user";
const OTP_KEY_PREFIX = "dl_otp_";
const OTP_EXPIRY_MINUTES = 10;

const seedUsers = () => {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) return;

  const defaultUsers = [
    {
      id: "user_1001",
      email: "lingarajroutwork@gmail.com",
      phone: "+918917622925",
      passwordHash: "dl_hash_12", // simulated hash
      name: "Lingaraj Rout (Founder)",
      role: "super_admin",
      panels: ["/devs.panel", "/admin.panel", "/dev.edit.panel"],
      method: "email",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "user_1002",
      email: "chiranjibir987@gmail.com",
      phone: "+917327859285",
      passwordHash: "dl_hash_12",
      name: "Chiranjibi (Developer)",
      role: "developer",
      panels: ["/devs.panel", "/admin.panel", "/dev.edit.panel"],
      method: "email",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
};

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const simulateHash = (pw) => "dl_hash_" + pw.length; // demo only — use bcrypt in production

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedUsers();
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  /* ───────── Helpers ───────── */
  const findUserByEmail = (email) =>
    readUsers().find((u) => u.email && u.email.toLowerCase() === email.toLowerCase().trim());

  const findUserByPhone = (phone) =>
    readUsers().find((u) => u.phone === phone.replace(/\s/g, ""));

  const setSession = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  /* ───────── PUBLIC SIGN UP ───────── */

  // Gmail sign up: create password
  const signupWithEmail = (email, password, name) => {
    const emailLower = email.trim().toLowerCase();
    if (!emailLower) throw new Error("Gmail is required.");
    if (findUserByEmail(emailLower)) throw new Error("This Gmail is already registered.");
    if (!password || password.length < 6)
      throw new Error("Password must be at least 6 characters.");

    const users = readUsers();
    const newUser = {
      id: "user_" + Date.now(),
      email: emailLower,
      phone: "",
      passwordHash: simulateHash(password),
      name: name || emailLower.split("@")[0],
      role: users.length === 0 ? "super_admin" : "property_owner",
      panels: users.length === 0 ? ["/devs.panel", "/admin.panel", "/dev.edit.panel"] : [],
      method: "email",
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  };

  // Phone sign up: request OTP then verify
  const requestSignupOtp = (phone) => {
    const normalized = phone.replace(/\s/g, "");
    if (!normalized) throw new Error("Phone number is required.");
    const u = findUserByPhone(normalized);
    if (u) throw new Error("This phone is already registered. Use Sign In instead.");

    const otp = generateOtp();
    localStorage.setItem(OTP_KEY_PREFIX + normalized, JSON.stringify({ otp, type: "signup", expires: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000 }));
    return { message: "Dhanalaxmi Group: OTP " + otp + " sent to " + normalized };
  };

  const verifySignupOtp = (phone, otp, password, name) => {
    const normalized = phone.replace(/\s/g, "");
    const stored = localStorage.getItem(OTP_KEY_PREFIX + normalized);
    if (!stored) throw new Error("No OTP found. Request a new OTP.");
    const { otp: savedOtp, expires, type } = JSON.parse(stored);
    if (type !== "signup") throw new Error("Invalid OTP type.");
    if (Date.now() > expires) throw new Error("OTP expired. Request a new one.");
    if (savedOtp !== otp) throw new Error("Invalid OTP.");
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

    const users = readUsers();
    const newUser = {
      id: "user_" + Date.now(),
      email: "",
      phone: normalized,
      passwordHash: simulateHash(password),
      name: name || "User " + normalized.slice(-4),
      role: users.length === 0 ? "super_admin" : "property_owner",
      panels: users.length === 0 ? ["/devs.panel", "/admin.panel", "/dev.edit.panel"] : [],
      method: "phone",
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    users.push(newUser);
    writeUsers(users);
    localStorage.removeItem(OTP_KEY_PREFIX + normalized);
    return newUser;
  };

  /* ───────── SIGN IN ───────── */

  // Gmail sign in: email + password (or Google Auth in production)
  const loginWithEmail = (email, password) => {
    const u = findUserByEmail(email);
    if (!u) throw new Error("Unregistered Gmail. Sign up first.");
    if (!u.isActive) throw new Error("Account is deactivated. Contact administrator.");
    if (u.method === "google") throw new Error("This account was created with Google. Use Sign In with Google.");
    if (u.passwordHash !== simulateHash(password))
      throw new Error("Wrong password. Try again.");

    const userData = {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      panels: u.panels,
      method: "email",
    };
    setSession(userData);
    return userData;
  };

  // Google sign in (uses Google's own auth — we never see/store the Gmail password)
  const loginWithGoogle = (email, name) => {
    const emailLower = email.trim().toLowerCase();
    if (!emailLower) throw new Error("Gmail is required.");

    let u = findUserByEmail(emailLower);
    if (!u) {
      // Auto-register via Google
      const users = readUsers();
      u = {
        id: "user_" + Date.now(),
        email: emailLower,
        phone: "",
        passwordHash: "",
        name: name || emailLower.split("@")[0],
        role: users.length === 0 ? "super_admin" : "property_owner",
        panels: users.length === 0 ? ["/devs.panel", "/admin.panel", "/dev.edit.panel"] : [],
        method: "google",
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      users.push(u);
      writeUsers(users);
    }
    if (!u.isActive) throw new Error("Account is deactivated.");

    const userData = {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      panels: u.panels,
      method: "google",
    };
    setSession(userData);
    return userData;
  };

  // Phone sign in: request OTP then verify
  const requestSigninOtp = (phone) => {
    const normalized = phone.replace(/\s/g, "");
    if (!normalized) throw new Error("Phone number is required.");
    const u = findUserByPhone(normalized);
    if (!u) throw new Error("This phone is not registered. Sign up first.");

    const otp = generateOtp();
    localStorage.setItem(OTP_KEY_PREFIX + normalized, JSON.stringify({ otp, type: "signin", expires: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000 }));
    return { message: "Dhanalaxmi Group: OTP " + otp + " sent to " + normalized };
  };

  const verifySigninOtp = (phone, otp) => {
    const normalized = phone.replace(/\s/g, "");
    const stored = localStorage.getItem(OTP_KEY_PREFIX + normalized);
    if (!stored) throw new Error("No OTP found. Request a new OTP.");
    const { otp: savedOtp, expires, type } = JSON.parse(stored);
    if (type !== "signin") throw new Error("Invalid OTP type.");
    if (Date.now() > expires) throw new Error("OTP expired. Request a new one.");
    if (savedOtp !== otp) throw new Error("Invalid OTP.");

    const u = findUserByPhone(normalized);
    const userData = {
      id: u.id,
      email: u.email,
      phone: u.phone,
      name: u.name,
      role: u.role,
      panels: u.panels,
      method: "phone",
    };
    localStorage.removeItem(OTP_KEY_PREFIX + normalized);
    setSession(userData);
    return userData;
  };

  /* ───────── FORGOT PASSWORD (phone only) ───────── */

  const requestForgotOtp = (phone) => {
    const normalized = phone.replace(/\s/g, "");
    if (!normalized) throw new Error("Phone number is required.");
    const u = findUserByPhone(normalized);
    if (!u) throw new Error("This phone is not registered.");
    if (u.method === "google") throw new Error("Use Google Sign In instead.");

    const otp = generateOtp();
    localStorage.setItem(OTP_KEY_PREFIX + normalized, JSON.stringify({ otp, type: "forgot", expires: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000 }));
    return { message: "Dhanalaxmi Group: OTP " + otp + " sent to " + normalized };
  };

  const resetPasswordWithOtp = (phone, otp, newPassword) => {
    const normalized = phone.replace(/\s/g, "");
    const stored = localStorage.getItem(OTP_KEY_PREFIX + normalized);
    if (!stored) throw new Error("No OTP found. Request a new OTP.");
    const { otp: savedOtp, expires, type } = JSON.parse(stored);
    if (type !== "forgot") throw new Error("Invalid OTP type.");
    if (Date.now() > expires) throw new Error("OTP expired. Request a new one.");
    if (savedOtp !== otp) throw new Error("Invalid OTP.");
    if (!newPassword || newPassword.length < 6)
      throw new Error("New password must be at least 6 characters.");

    const users = readUsers();
    const idx = users.findIndex((u) => u.phone === normalized);
    if (idx === -1) throw new Error("User not found.");
    users[idx].passwordHash = simulateHash(newPassword);
    writeUsers(users);
    localStorage.removeItem(OTP_KEY_PREFIX + normalized);
    return { message: "Password reset successfully. You can now sign in." };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const hasAccess = (panelPath) => {
    if (!user) return false;
    return user.panels?.includes(panelPath) ?? false;
  };

  const value = {
    user,
    loading,
    signupWithEmail,
    requestSignupOtp,
    verifySignupOtp,
    loginWithEmail,
    loginWithGoogle,
    requestSigninOtp,
    verifySigninOtp,
    requestForgotOtp,
    resetPasswordWithOtp,
    logout,
    hasAccess,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
