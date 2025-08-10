import { useState } from "react";
import { register as apiRegister } from "../services/auth";
import { useAuth } from "../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { User, MapPin, Mail, Lock, UserPlus } from "lucide-react";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { user, token } = await apiRegister({
        username,
        email,
        password,
        location,
      });
      login(user, token);
      navigate("/swipe");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          (err.response?.data?.errors &&
            Object.values(err.response.data.errors).flat().join(" ")) ||
          "Registration failed";
        setError(typeof message === "string" ? message : "Registration failed");
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
            <UserPlus className="h-4 w-4" /> Create account
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
            Join CarSwipe
          </h1>
          <p className="mt-1 text-slate-600">
            Sell your car and chat with buyers
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Username
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <User className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full outline-none text-slate-900 placeholder-slate-400"
                placeholder="johndoe"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Location
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full outline-none text-slate-900 placeholder-slate-400"
                placeholder="Atlanta, GA"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none text-slate-900 placeholder-slate-400"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none text-slate-900 placeholder-slate-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-xs text-slate-600 hover:text-slate-900">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2.5 hover:opacity-90 transition disabled:opacity-50">
            <UserPlus className="h-5 w-5" />
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <div className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
