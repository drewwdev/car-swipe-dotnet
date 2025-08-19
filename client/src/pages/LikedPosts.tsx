import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  status?: "Active" | "Sold";
}

export default function LikedPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fmtPrice = (n: number) =>
    n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const res = await api.get("/posts/liked");
        setPosts(res.data);
      } catch (err) {
        setError("Failed to load liked posts.");
        console.error("❌ Failed to load liked posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Posts Liked by Other Users
          </h2>
          <p className="mt-1 text-slate-600">
            Your listings that have received likes.
          </p>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {loading ? (
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-8 text-center shadow-sm">
            <p className="text-slate-700">Loading…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-8 text-center shadow-sm">
            <p className="text-slate-700">No liked posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate(`/posts/${post.id}`)}
                className="text-left group rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="relative">
                  <PostImage
                    urls={post.imageUrls}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-900">
                    {fmtPrice(post.price)}
                  </div>
                  {post.status && (
                    <div
                      className={[
                        "absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-medium",
                        post.status === "Sold"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700",
                      ].join(" ")}>
                      {post.status}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-slate-600">
                    {post.make} {post.model} • {post.year} •{" "}
                    {post.mileage.toLocaleString()} mi
                  </p>
                  <p className="text-slate-500 text-sm">{post.location}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
