import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, ComponentType } from "react";
import {
  Car,
  Heart,
  MessageSquare,
  LogOut,
  PlusCircle,
  Compass,
  Gauge,
  Clock,
  DollarSign,
} from "lucide-react";
import api from "../lib/api";
import { isAxiosError } from "../lib/http";

type StatsOverview = {
  myPosts: number;
  carsSold: number;
  carsBought: number;
  likedByMe: number;
  dislikedByMe: number;
  likedByOthers: number;
  cashEarned: number;
  cashSpent: number;
  activeChats: number;
};

type ActivityItem = {
  createdAt: string;
  type: string;
  summary: string;
  postId?: number;
  chatId?: number;
  saleId?: number;
};

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    myPosts: 0,
    likedByOthers: 0,
    chats: 0,
  });
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const ACTIVITY_LIMIT = 20;
  const ACTIVITY_DAYS = 30;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const money = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const timeAgo = (iso: string) => {
    const t = new Date(iso).getTime();
    const d = Math.max(0, Date.now() - t);
    const m = Math.floor(d / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case "PostCreated":
        return Car;
      case "SaleClosedAsSeller":
      case "SaleClosedAsBuyer":
        return DollarSign;
      case "SwipeReceived":
        return Heart;
      case "MessageSent":
      case "MessageReceived":
        return MessageSquare;
      default:
        return Clock;
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const [o, a] = await Promise.all([
          api.get("/api/stats/overview"),
          api.get(`/api/stats/activity-basic?limit=${ACTIVITY_LIMIT}`),
        ]);

        const cutoff = Date.now() - ACTIVITY_DAYS * 24 * 60 * 60 * 1000;
        const pruned = (a.data as ActivityItem[])
          .filter((it) => new Date(it.createdAt).getTime() >= cutoff)
          .slice(0, ACTIVITY_LIMIT);

        setOverview(o.data);
        setActivity(pruned);
      } catch (e: unknown) {
        let msg = "Failed to load overview/activity.";
        if (isAxiosError(e)) {
          const data = e.response?.data as { message?: string } | undefined;
          msg = data?.message ?? e.message ?? msg;
        } else if (e instanceof Error) {
          msg = e.message;
        }
        console.error("❌ dashboard overview/activity error:", msg);
      }
    };
    if (token) run();
  }, [token]);

  useEffect(() => {
    const fetchStuff = async () => {
      try {
        const [mine, liked, chats] = await Promise.all([
          api.get("/api/posts/me"),
          api.get("/api/posts/liked"),
          api.get("/api/chat/me"),
        ]);

        setStats({
          myPosts: mine.data.length ?? 0,
          likedByOthers: liked.data.length ?? 0,
          chats: chats.data.length ?? 0,
        });
      } catch (err: unknown) {
        let msg = "Failed to fetch dashboard data.";
        if (isAxiosError(err)) {
          const data = err.response?.data as { message?: string } | undefined;
          msg = data?.message ?? err.message ?? msg;
        } else if (err instanceof Error) {
          msg = err.message;
        }
        console.error("❌ dashboard mini-stats error:", msg);
      }
    };
    if (token) fetchStuff();
  }, [token]);

  const Stat = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: number | string;
    icon: ComponentType<{ className?: string }>;
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

  const welcomeName = user?.username ?? user?.email ?? "";

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
                Welcome{welcomeName ? `, ${welcomeName}` : ""} 👋
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

          {overview && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Stat label="Cars Sold" value={overview.carsSold} icon={Car} />
              <Stat
                label="Cars Bought"
                value={overview.carsBought}
                icon={Car}
              />
              <Stat
                label="Cash Earned"
                value={money(overview.cashEarned)}
                icon={DollarSign}
              />
              <Stat
                label="Cash Spent"
                value={money(overview.cashSpent)}
                icon={DollarSign}
              />
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          {activity.length > 0 && (
            <div className="mt-5 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
              <div className="mb-3 text-lg font-semibold text-slate-900">
                Recent Activity
              </div>
              <div className="divide-y divide-slate-200/60">
                {activity.map((it, idx) => {
                  const Icon = activityIcon(it.type);
                  const onClick = () => {
                    if (it.postId) navigate(`/posts/${it.postId}`);
                    else if (it.chatId) navigate(`/chats/${it.chatId}`);
                  };
                  return (
                    <button
                      key={idx}
                      onClick={onClick}
                      className="w-full text-left flex items-center gap-3 py-3 hover:bg-white/60 rounded-xl px-2 transition">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <div className="text-slate-900 font-medium">
                          {it.summary}
                        </div>
                        <div className="text-xs text-slate-500">{it.type}</div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {timeAgo(it.createdAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
