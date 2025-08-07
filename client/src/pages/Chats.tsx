import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

interface Chat {
  id: number;
  buyerId: number;
  sellerId: number;
  post: {
    title: string;
  };
}

export default function Chats() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:5277/api/chat/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch chats:", err);
        setError("Failed to load chats.");
      }
    };

    fetchChats();
  }, [token]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Your Chats</h2>
      {error && <p className="text-red-500">{error}</p>}
      {chats.length === 0 ? (
        <p>No chats found.</p>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chats/${chat.id}`)}
              className="cursor-pointer p-4 bg-white rounded shadow hover:bg-gray-50">
              <p className="font-semibold">
                Chat about: {chat.post?.title ?? "Post"}
              </p>
              <p className="text-sm text-gray-500">Chat ID: {chat.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
