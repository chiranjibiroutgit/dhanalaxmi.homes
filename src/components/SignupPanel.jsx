import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Phone, Send, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Sign Up Page — Public website only
 * Two methods: Gmail (create password) | Phone (OTP verify)
 * Footer: "Have an account?" → goes to Sign In page
 */
export default function SignupPanel() {
  const [method, setMethod] = useState("email"); // 'email' | 'phone'
  const [step, setStep] = useState("form"); // 'form' | 'otp' | 'success'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signupWithEmail, requestSignupOtp, verifySignupOtp } = useAuth();

  const METHODS = [
    { key: "email", label: "Gmail", icon: <Mail size={16} strokeWidth={2} /> },
    { key: "phone", label: "Phone", icon: <Phone size={16} strokeWidth={2} /> },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      try {
        if (method === "email") {
          if (!name) throw new Error("Full name is required.");
          if (password.length < 6) throw new Error("Password must be at least 6 characters.");
          signupWithEmail(email.trim().toLowerCase(), password, name);
          setStep("success");
        } else {
          const res = requestSignupOtp(phone);
          setStep("otp");
          setError("");
          // In production, show the OTP message via SMS UI
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 700);
  };

  const handleVerifyOtp = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      try {
        if (!password || password.length < 6)
          throw new Error("Password must be at least 6 characters.");
        verifySignupOtp(phone, otp, password, name);
        navigate("/");
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 600);
  };

  const isOtpStep = step === "otp";

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 w-full max-w-md shadow-2xl">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center text-navy font-bold text-xl">DL</div>
          <div>
            <div className="font-serif text-xl font-bold text-white tracking-tight">DHANALAXMI</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">homes.com</div>
          </div>
        </div>

        <h2 className="font-serif text-2xl font-bold text-white mb-1">
          {step === "success" ? "Account Created" : "Create Account"}
        </h2>
        <p className="text-[12px] text-gray-400 mb-6">
          {step === "success"
            ? "Welcome to Dhanalaxmi Group. You can now sign in to access your panels."
            : "Join Dhanalaxmi Group to access developer and admin panels."}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium">
            {error}
          </div>
        )}

        {/* Method tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-white/5 border border-white/10 p-0.5">
          {METHODS.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMethod(m.key);
                setError("");
                setStep("form");
              }}
              className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                method === m.key ? "bg-gold text-navy shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gmail / Phone input */}
          {step === "form" && (
            <>
              {method === "email" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      strokeWidth={2}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                </div>
              )}

              {method === "phone" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      strokeWidth={2}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 89176 22925"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Dhanalaxmi Group will send an OTP to verify your phone.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Name (email sign up only) */}
          {step === "form" && method === "email" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lingaraj Rout"
                autoComplete="name"
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-4 pr-4 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          )}

          {/* Password (email sign up only) */}
          {step === "form" && method === "email" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                Create Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-12 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-gold"
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-gray-400">Minimum 6 characters</p>
            </div>
          )}

          {/* OTP verify (phone sign up) */}
          {isOtpStep && method === "phone" && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <Send
                    size={16}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength="6"
                    autoComplete="otp"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Enter the 6-digit OTP sent to your phone</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-12 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-gold"
                  >
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Minimum 6 characters</p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold text-navy font-bold text-[12px] uppercase tracking-wider rounded-xl transition-all hover:bg-white active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : step === "success"
                ? "Done"
                : method === "phone" && step === "otp"
                  ? "Verify OTP & Create Account"
                  : method === "phone"
                    ? "Send OTP"
                    : "Create Account"
          }
          </button>
        </form>

        {step === "success" && (
          <div className="mt-6 text-center">
            <p className="text-[11px] text-gray-400 mb-4">
              Your account is ready.{" "}
              <Link
                to="/login"
                className="text-gold font-bold underline underline-offset-2 hover:text-white"
              >
                Sign In
              </Link>
            </p>
            <Link
              to="/"
              className="text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
            >
              ← Back to Public Site
            </Link>
          </div>
        )}

        {!step === "success" && (
          <div className="mt-6 text-center">
            <p className="text-[11px] text-gray-400 mb-3">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-gold font-bold underline underline-offset-2 hover:text-white"
              >
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
