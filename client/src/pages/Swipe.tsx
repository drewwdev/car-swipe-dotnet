import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5277/api/posts/available",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPosts(res.data);
      } catch (err) {
        setError("Failed to load posts.");
        console.error("❌ Failed to load posts:", err);
      }
    };

    fetchPosts();
  }, [token]);

  const currentPost = posts[currentIndex];

  const handleSwipe = async (direction: "Left" | "Right") => {
    if (!currentPost) return;

    try {
      const res = await axios.post(
        "http://localhost:5277/api/swipes",
        {
          postId: currentPost.id,
          buyerId: user?.id,
          direction: direction === "Right" ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (direction === "Right") {
        const chatId = res.data?.chatId;
        if (chatId) {
          toast.success("✅ Chat created! Redirecting...");
          navigate(`/chats/${chatId}`);
          return;
        } else {
          toast.success("👍 Liked");
        }
      } else {
        toast("👎 Disliked");
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Swipe failed:", err);
      setError("Failed to record swipe.");
      toast.error("Swipe failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Swipe Cars</h2>
      {error && <p className="text-red-500">{error}</p>}

      {!currentPost ? (
        <p>No more cars to show.</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
          <h3 className="text-xl font-bold mb-2">{currentPost.title}</h3>
          <p className="mb-2">{currentPost.description}</p>
          <ul className="mb-4 text-gray-700">
            <li>
              <strong>Make:</strong> {currentPost.make}
            </li>
            <li>
              <strong>Model:</strong> {currentPost.model}
            </li>
            <li>
              <strong>Year:</strong> {currentPost.year}
            </li>
            <li>
              <strong>Mileage:</strong> {currentPost.mileage}
            </li>
            <li>
              <strong>Price:</strong> ${currentPost.price}
            </li>
            <li>
              <strong>Location:</strong> {currentPost.location}
            </li>
          </ul>
          {currentPost.imageUrls.length > 0 && (
            <img
              src={currentPost.imageUrls[0]}
              alt="Car"
              className="rounded w-full max-h-64 object-cover mb-4"
            />
          )}

          <div className="flex justify-around">
            <button
              onClick={() => handleSwipe("Left")}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
              👎 Dislike
            </button>
            <button
              onClick={() => handleSwipe("Right")}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
              👍 Like
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
