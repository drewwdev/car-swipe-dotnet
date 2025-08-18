import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PostImage from "../components/PostImage";
import api from "../lib/api";
import { isAxiosError } from "../lib/http";

interface Post {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  status: "Active" | "Sold";
}

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<"Sold" | "Active" | null>(
    null
  );
  const [updating, setUpdating] = useState(false);

  const fmtPrice = (n: number) =>
    n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  useEffect(() => {
    const ctrl = new AbortController();

    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/posts/me", { signal: ctrl.signal });
        setPosts(res.data);
      } catch (err: unknown) {
        if (
          (err instanceof DOMException && err.name === "AbortError") ||
          (isAxiosError(err) &&
            (err.name === "CanceledError" || err.code === "ERR_CANCELED"))
        ) {
          return;
        }

        if (isAxiosError(err)) {
          const data = err.response?.data as { message?: string } | undefined;
          setError(data?.message ?? err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load your posts.");
        }

        console.error("❌ fetch posts error:", err);
      }
    };

    fetchPosts();
    return () => ctrl.abort();
  }, []);

  const openConfirm = (postId: number, nextStatus: "Sold" | "Active") => {
    setPendingId(postId);
    setPendingStatus(nextStatus);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingId || !pendingStatus) return;
    setUpdating(true);
    try {
      await api.patch(`/api/posts/${pendingId}/status`, {
        status: pendingStatus,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === pendingId ? { ...p, status: pendingStatus } : p
        )
      );
      toast.success(
        pendingStatus === "Sold"
          ? "Post marked as sold!"
          : "Post set back to active."
      );
      setConfirmOpen(false);
    } catch (err: unknown) {
      console.error("❌ update status error:", err);

      let message = "Failed to update status.";
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        message = data?.message ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
    } finally {
      setUpdating(false);
      setPendingId(null);
      setPendingStatus(null);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted!");
    } catch (err: unknown) {
      console.error("❌ delete post error:", err);

      let message = "Failed to delete post.";
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        message = data?.message ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Posts
          </h2>
          <button
            onClick={() => navigate("/create-post")}
            className="rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition">
            Create Post
          </button>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-8 text-center shadow-sm">
            <p className="text-slate-700">You haven't created any posts yet.</p>
            <button
              onClick={() => navigate("/create-post")}
              className="mt-4 rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition">
              Create your first post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm hover:shadow-md transition overflow-hidden">
                <Link to={`/posts/${post.id}`} className="block">
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
                </Link>

                <div className="p-4">
                  <Link to={`/posts/${post.id}`} className="block">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:underline">
                      {post.title}
                    </h3>
                  </Link>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.status !== "Sold" ? (
                      <button
                        onClick={() => openConfirm(post.id, "Sold")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50 transition">
                        Mark as Sold
                      </button>
                    ) : (
                      <button
                        onClick={() => openConfirm(post.id, "Active")}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50 transition">
                        Mark Active
                      </button>
                    )}
                    <Link
                      to={`/posts/edit/${post.id}`}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50 transition">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-sm hover:bg-red-700 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !updating && setConfirmOpen(false)}
          />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              {pendingStatus === "Sold"
                ? "Mark post as Sold?"
                : "Set post back to Active?"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {pendingStatus === "Sold"
                ? "Buyers will see this as sold and it will be excluded from browse."
                : "The post will be visible in browse again."}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={updating}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={updating}
                className="rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition disabled:opacity-50">
                {updating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
