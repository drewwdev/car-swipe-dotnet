import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

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

export default function LikedPosts() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5277/api/posts/liked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(res.data);
      } catch (err) {
        console.error("❌ Failed to load liked posts:", err);
        setError("Failed to load liked posts.");
      }
    };

    fetchLikedPosts();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Posts Liked by Other Users</h2>
      {error && <p className="text-red-500">{error}</p>}
      {posts.length === 0 ? (
        <p>No liked posts yet.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded shadow p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/posts/${post.id}`)}>
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-gray-600">
                {post.make} {post.model} — ${post.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
