import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Car,
  Heart,
  MessageSquare,
  LogOut,
  PlusCircle,
  Compass,
  Gauge,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    myPosts: 0,
    likedByOthers: 0,
    chats: 0,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchStuff = async () => {
      try {
        const [mine, liked, chats] = await Promise.all([
          axios.get("http://localhost:5277/api/posts/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5277/api/posts/liked", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5277/api/chat/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          myPosts: mine.data.length ?? 0,
          likedByOthers: liked.data.length ?? 0,
          chats: chats.data.length ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchStuff();
  }, [token]);

  const Stat = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: number;
    icon;
  }) => (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur border border-white/40 px-4 py-3 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="text-lg font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
                <Gauge className="h-4 w-4" /> Dashboard
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
                Welcome
                {user?.username || user?.email
                  ? `, ${user?.username ?? user?.email}`
                  : ""}{" "}
                👋
              </h1>
              <p className="mt-1 text-slate-600">
                Quick snapshot of your account.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/create-post")}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition">
                <PlusCircle className="h-5 w-5" />
                New Post
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="My Posts" value={stats.myPosts} icon={Car} />
            <Stat
              label="Liked by Others"
              value={stats.likedByOthers}
              icon={Heart}
            />
            <Stat
              label="Active Chats"
              value={stats.chats}
              icon={MessageSquare}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate("/swipe")}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-left bg-white/70 backdrop-blur border border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ring-1 ring-indigo-300/60 hover:ring-indigo-400/70">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-[1.03] transition">
              <Compass className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-slate-900">
                Browse Posts
              </span>
              <span className="block text-sm text-slate-500">
                Swipe through available cars
              </span>
            </span>
          </button>

          <button
            onClick={() => navigate("/my-posts")}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-left bg-white/70 backdrop-blur border border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ring-1 ring-slate-200/60 hover:ring-slate-300/70">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-[1.03] transition">
              <Car className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-slate-900">
                My Posts
              </span>
              <span className="block text-sm text-slate-500">
                Manage your listings
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
