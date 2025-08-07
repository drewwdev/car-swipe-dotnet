import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome!</h1>
        {user && (
          <p className="text-gray-700 text-lg">
            Logged in as <strong>{user.email}</strong>
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            onClick={() => navigate("/create-post")}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition">
            ➕ Create Post
          </button>

          <button
            onClick={() => navigate("/swipe")}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
            🚗 View Posts
          </button>

          <button
            onClick={() => navigate("/my-posts")}
            className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition">
            📋 My Posts
          </button>

          <button
            onClick={() => navigate("/liked-posts")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2">
            See Liked Posts
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition">
            🔒 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
