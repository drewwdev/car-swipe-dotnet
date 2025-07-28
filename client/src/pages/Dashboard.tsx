import { useAuth } from "../context/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        {user && (
          <p className="text-gray-700">
            Logged in as <strong>{user.email}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
