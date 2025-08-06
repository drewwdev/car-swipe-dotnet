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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        {user && (
          <p className="text-gray-700">
            Logged in as <strong>{user.email}</strong>
          </p>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Logout
        </button>
      </div>
    </div>
  );
}
