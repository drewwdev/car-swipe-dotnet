import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-100 px-4 py-2 shadow mb-4 flex justify-between items-center">
      <button
        onClick={() => navigate("/dashboard")}
        className="text-xl font-semibold text-blue-600 hover:underline">
        Dashboard
      </button>
    </nav>
  );
}
