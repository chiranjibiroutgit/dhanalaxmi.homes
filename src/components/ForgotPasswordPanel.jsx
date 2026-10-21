import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Send, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Forgot Password Page — Phone OTP only
 * User enters phone → receives OTP → creates new password
 */
export default function ForgotPasswordPanel() {
  const [step, setStep] = useState("phone"); // 'phone' | 'otp' | 'password' | 'success'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { requestForgotOtp, resetPasswordWithOtp } = useAuth();

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      try {
        requestForgotOtp(phone);
        setStep("otp");
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 600);
  };

  const handleVerifyOtp = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      try {
        // Just verify OTP is valid format, then move to password step
        if (!otp || otp.length !== 6) throw new Error("Enter a valid 6-digit OTP.");
        setStep("password");
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 500);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      try {
        if (!newPassword || newPassword.length < 6)
          throw new Error("New password must be at least 6 characters.");
        if (newPassword !== confirmPassword)
          throw new Error("Passwords do not match.");
        resetPasswordWithOtp(phone, otp, newPassword);
        setStep("success");
        setSuccess("Password reset successfully. You can now sign in.");
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center text-navy font-bold text-xl">DL</div>
          <div>
            <div className="font-serif text-xl font-bold text-white tracking-tight">DHANALAXMI</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">homes.com</div>
          </div>
        </div>

        <h2 className="font-serif text-2xl font-bold text-white mb-1">Forgot Password</h2>
        <p className="text-[12px] text-gray-400 mb-6">
          Reset your password using your registered phone number.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-medium">
            {success}
          </div>
        )}

        <form onSubmit={step === "password" ? handleResetPassword : handleRequestOtp} className="space-y-4">
          {step === "phone" && (
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

          {step === "otp" && (
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
                <p className="mt-1 text-[10px] text-gray-400">Simulated OTP: any 6 digits</p>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                  New Password
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

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-4 pr-4 text-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
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
              : step === "phone"
                ? "Send OTP"
                : step === "otp"
                  ? "Verify OTP"
                  : "Reset Password"
          }
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-gray-400 mb-3">
            Remember your password?{" "}
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
      </div>
    </div>
  );
}
