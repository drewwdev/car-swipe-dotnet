import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import * as signalR from "@microsoft/signalr";

interface Message {
  id: number;
  senderId: number;
  text: string;
  sentAt: string;
}

export default function ChatDetail() {
  const { token, user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5277/api/chat/${chatId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages.");
      }
    };

    fetchMessages();
  }, [chatId, token]);

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5277/chathub?chatId=${chatId}`, {
        accessTokenFactory: () => token || "",
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connect
      .start()
      .then(() => {
        console.log("✅ Connected to SignalR");

        connect.on("ReceiveMessage", (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });

        setConnection(connect);
      })
      .catch((err) => {
        console.error("❌ SignalR connection failed:", err);
        setError("Real-time connection failed.");
      });

    return () => {
      connect.stop();
    };
  }, [token]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !connection) return;

    try {
      await connection.invoke("SendMessage", Number(chatId), newMessage);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">Chat #{chatId}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="bg-white p-4 rounded shadow max-h-[60vh] overflow-y-auto mb-4 space-y-2">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded ${
                msg.senderId === user?.id
                  ? "bg-blue-100 text-right"
                  : "bg-gray-200 text-left"
              }`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-gray-500">
                {new Date(msg.sentAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}
