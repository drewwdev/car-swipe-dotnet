import { useState } from "react";
import { login as apiLogin } from "../services/auth";
import { useAuth } from "../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { user, token } = await apiLogin({ email, password });
      login(user, token);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
            <LogIn className="h-4 w-4" /> Sign in
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1 text-slate-600">Access your listings and chats</p>
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
                autoFocus
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
            <LogIn className="h-5 w-5" />
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center text-sm text-slate-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-slate-900 hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
