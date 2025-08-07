import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
}

export default function MyPosts() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5277/api/posts/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(res.data);
      } catch (err) {
        setError("Failed to load your posts.");
        console.error(err);
      }
    };

    fetchPosts();
  }, [token]);

  const handleDelete = async (postId: number) => {
    try {
      await axios.delete(`http://localhost:5277/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">My Posts</h2>
      {error && <p className="text-red-500">{error}</p>}

      {posts.length === 0 ? (
        <p>You haven't created any posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow p-4 rounded hover:shadow-md transition duration-200 relative">
              {post.imageUrls.length > 0 && (
                <Link to={`/posts/${post.id}`}>
                  <img
                    src={post.imageUrls[0]}
                    alt="Car"
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                </Link>
              )}
              <Link to={`/posts/${post.id}`}>
                <h3 className="text-lg font-semibold hover:underline">
                  {post.title}
                </h3>
              </Link>
              <p className="text-gray-600">${post.price}</p>

              <button
                onClick={() => handleDelete(post.id)}
                className="absolute top-2 right-2 text-sm text-red-600 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
