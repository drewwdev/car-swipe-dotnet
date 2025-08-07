import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [hasLikedPosts, setHasLikedPosts] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5277/api/posts/liked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.length > 0) {
          setHasLikedPosts(true);
        }
      } catch (err) {
        console.error("❌ Failed to fetch liked posts:", err);
      }
    };

    fetchLikedPosts();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome!</h1>

        {user && (
          <p className="text-gray-700">
            Logged in as <strong>{user.email}</strong>
          </p>
        )}

        <button
          onClick={() => navigate("/create-post")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          Create Post
        </button>

        <button
          onClick={() => navigate("/my-posts")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
          My Posts
        </button>

        <button
          onClick={() => navigate("/liked-posts")}
          className="relative bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
          Posts Liked by Others
          {hasLikedPosts && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-2 py-0.5">
              NEW
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/chats")}
          className="relative bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
          View Chats
        </button>

        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
          Logout
        </button>
      </div>
    </div>
  );
}
