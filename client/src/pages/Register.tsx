import { useState } from "react";
import { register } from "../services/auth";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { user, token } = await register({
        username,
        email,
        password,
        location,
      });

      login(user, token);
      navigate("/swipe");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          (err.response?.data?.errors &&
            Object.values(err.response.data.errors).flat().join(" ")) ||
          "Registration failed";
        setError(message);
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          className="border p-2 mb-3 w-full rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="border p-2 mb-4 w-full rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-3 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}
