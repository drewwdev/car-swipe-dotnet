import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  CarFront,
  Calendar,
  Gauge,
  MapPin,
  DollarSign,
  Info,
  Edit3,
} from "lucide-react";
import PostImage from "../components/PostImage";
import api from "../lib/api";

interface Post {
  id: number;
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  imageUrls: string[];
  createdAt: string;
  userId: number;
  status?: "Active" | "Sold";
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const currentUserId = useMemo(() => {
    if (user?.id) return Number(user.id);
    try {
      if (!token) return undefined;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const claim =
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
      return claim ? Number(claim) : undefined;
    } catch {
      return undefined;
    }
  }, [token, user?.id]);

  const isOwner = post && currentUserId === post.userId;

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}`, { signal: ctrl.signal });
        setPost(res.data);
        setSelectedIdx(0);
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError("Failed to fetch post.");
        console.error("❌ Post fetch error:", err);
      }
    };
    if (id) fetchPost();
    return () => ctrl.abort();
  }, [id]);

  const timeAgo = useMemo(() => {
    if (!post?.createdAt) return "";
    const then = new Date(post.createdAt).getTime();
    const diff = Math.max(0, Date.now() - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }, [post?.createdAt]);

  const fmtPrice = (n: number) =>
    n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!post) return <p className="p-6">Loading…</p>;

  const selectedUrl = post.imageUrls?.[selectedIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
                <CarFront className="h-4 w-4" /> Listing
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
                {post.title}
              </h1>
              <p className="mt-1 text-slate-600">
                {post.make} {post.model} • {post.year} •{" "}
                {post.mileage.toLocaleString()} miles
              </p>
              <p className="mt-1 text-slate-500 text-sm">Listed {timeAgo}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
                {fmtPrice(post.price)}
              </div>
              {post.status && (
                <span
                  className={[
                    "mt-2 inline-block rounded-full px-3 py-1 text-xs",
                    post.status === "Sold"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}>
                  {post.status}
                </span>
              )}
              {isOwner && (
                <Link
                  to={`/posts/edit/${post.id}`}
                  className="ml-2 mt-2 inline-flex items-center gap-1 rounded-2xl border border-slate-300 bg-white px-3 py-1.5 text-slate-900 hover:bg-slate-50 transition">
                  <Edit3 className="h-4 w-4" /> Edit
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm">
          <PostImage
            src={selectedUrl}
            className="h-[380px] w-full object-cover"
          />
        </div>

        {post.imageUrls && post.imageUrls.length > 1 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {post.imageUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={[
                  "overflow-hidden rounded-xl border",
                  selectedIdx === idx ? "border-slate-900" : "border-white/50",
                ].join(" ")}>
                <PostImage src={url} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm lg:col-span-1">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Specs</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <CarFront className="h-5 w-5 text-slate-900" />
                <span className="flex-1">Make</span>
                <span className="font-medium text-slate-900">{post.make}</span>
              </li>
              <li className="flex items-center gap-3">
                <Info className="h-5 w-5 text-slate-900" />
                <span className="flex-1">Model</span>
                <span className="font-medium text-slate-900">{post.model}</span>
              </li>
              <li className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-900" />
                <span className="flex-1">Year</span>
                <span className="font-medium text-slate-900">{post.year}</span>
              </li>
              <li className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-slate-900" />
                <span className="flex-1">Mileage</span>
                <span className="font-medium text-slate-900">
                  {post.mileage.toLocaleString()} mi
                </span>
              </li>
              <li className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-slate-900" />
                <span className="flex-1">Price</span>
                <span className="font-medium text-slate-900">
                  {fmtPrice(post.price)}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-900" />
                <span className="flex-1">Location</span>
                <span className="font-medium text-slate-900">
                  {post.location}
                </span>
              </li>
            </ul>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => navigate("/swipe")}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition">
                Back to Browse
              </button>
              <button
                onClick={() => navigate("/chats")}
                className="rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition">
                View Chats
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {post.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
