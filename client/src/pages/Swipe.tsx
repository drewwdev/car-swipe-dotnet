import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";

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
    if (!token) return;

    axios
      .get("http://localhost:5277/api/posts/available", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPosts(res.data);
      })
      .catch(() => setError("Failed to load posts"));
  }, [token]);

  const handleSwipe = async (direction: "Left" | "Right") => {
    if (!user || currentIndex >= posts.length) return;

    const post = posts[currentIndex];

    try {
      await axios.post(
        "http://localhost:5277/api/swipes",
        {
          buyerId: user.id,
          postId: post.id,
          direction,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentIndex((prev) => prev + 1);
    } catch {
      setError("Failed to send swipe");
    }
  };

  if (!token) return <p>Loading...</p>;
  if (currentIndex >= posts.length) return <p>No more cars to swipe on!</p>;

  const post = posts[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Swipe Cars</h2>
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white rounded shadow-md p-4 w-full max-w-md mb-4">
        {post.imageUrls.length > 0 && (
          <img
            src={post.imageUrls[0]}
            alt="Car"
            className="rounded mb-2 w-full"
          />
        )}
        <h3 className="text-xl font-semibold">{post.title}</h3>
        <p>
          {post.year} {post.make} {post.model}
        </p>
        <p>{post.mileage} miles</p>
        <p>${post.price.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Location: {post.location}</p>
        <p className="mt-2">{post.description}</p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => handleSwipe("Left")}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Pass
        </button>
        <button
          onClick={() => handleSwipe("Right")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Like
        </button>
      </div>
    </div>
  );
}
