import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PostImage from "../components/PostImage";
import {
  ThumbsDown,
  ThumbsUp,
  CarFront,
  DollarSign,
  Gauge,
  MapPin,
  Info,
} from "lucide-react";

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
}

export default function Swipe() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  const currentPost = useMemo(() => posts[currentIndex], [posts, currentIndex]);
  const remaining = useMemo(
    () => Math.max(0, posts.length - currentIndex - 1),
    [posts.length, currentIndex]
  );

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5277/api/posts/available",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPosts(res.data || []);
      } catch (err) {
        setError("Failed to load posts.");
        console.error("❌ Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [token]);

  const fmtPrice = (n: number) =>
    n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const advance = () => setCurrentIndex((i) => i + 1);

  const handleSwipe = useCallback(
    async (direction: "Left" | "Right") => {
      if (!currentPost || swiping) return;
      setSwiping(true);
      try {
        const res = await axios.post(
          "http://localhost:5277/api/swipes",
          {
            postId: currentPost.id,
            buyerId: user?.id,
            direction: direction === "Right" ? 1 : 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (direction === "Right") {
          const chatId = res.data?.chatId;
          if (chatId) {
            toast.success("Match! Opening chat…");
            navigate(`/chats/${chatId}`);
            return;
          }
          toast.success("Liked");
        } else {
          toast("Disliked");
        }
        advance();
      } catch (err) {
        console.error("❌ Swipe failed:", err);
        setError("Failed to record swipe.");
        toast.error("Swipe failed.");
      } finally {
        setSwiping(false);
      }
    },
    [currentPost, swiping, token, user?.id, navigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentPost) return;
      if (e.key === "ArrowLeft") handleSwipe("Left");
      if (e.key === "ArrowRight") handleSwipe("Right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPost, handleSwipe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-8 flex items-center justify-center">
        <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
            <CarFront className="h-4 w-4" />
            Browse
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Swipe Cars
            </h2>
            {posts.length > 0 && (
              <span className="text-sm text-slate-600">{remaining} left</span>
            )}
          </div>
          <p className="mt-1 text-slate-600">
            Like to connect. Dislike to skip.
          </p>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {!currentPost ? (
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-8 text-center shadow-sm">
            <p className="text-slate-700">No more cars to show.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm overflow-hidden">
            <div className="relative">
              <PostImage
                urls={currentPost.imageUrls}
                className="w-full h-72 object-cover"
              />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-900">
                {fmtPrice(currentPost.price)}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">
                {currentPost.title}
              </h3>
              <p className="mt-1 text-slate-600">{currentPost.description}</p>

              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-900" />
                  <span className="flex-1">Model</span>
                  <span className="font-medium text-slate-900">
                    {currentPost.make} {currentPost.model}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-900" />
                  <span className="flex-1">Price</span>
                  <span className="font-medium text-slate-900">
                    {fmtPrice(currentPost.price)}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-900" />
                  <span className="flex-1">Year</span>
                  <span className="font-medium text-slate-900">
                    {currentPost.year}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-slate-900" />
                  <span className="flex-1">Mileage</span>
                  <span className="font-medium text-slate-900">
                    {currentPost.mileage.toLocaleString()} mi
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-900" />
                  <span className="flex-1">Location</span>
                  <span className="font-medium text-slate-900">
                    {currentPost.location}
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleSwipe("Left")}
                  disabled={swiping}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2 text-slate-900 hover:bg-slate-50 transition disabled:opacity-50">
                  <ThumbsDown className="h-5 w-5" />
                  Dislike
                </button>
                <button
                  onClick={() => handleSwipe("Right")}
                  disabled={swiping}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-5 py-2 hover:opacity-90 transition disabled:opacity-50">
                  <ThumbsUp className="h-5 w-5" />
                  Like
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
