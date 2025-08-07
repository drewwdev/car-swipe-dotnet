import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

type Message = {
  id: number;
  senderId: number;
  text: string;
  sentAt: string;
};

export default function ChatDetail() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/chat/${chatId}/messages`);
      if (!res.ok) {
        console.error("Failed to load messages");
        return;
      }
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
  }, [chatId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const res = await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: newMessage }),
    });

    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    } else {
      console.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="border rounded p-4 mb-4 h-64 overflow-y-scroll bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <div className="text-sm text-gray-600">
              User {msg.senderId} - {new Date(msg.sentAt).toLocaleTimeString()}
            </div>
            <div className="bg-white p-2 rounded shadow">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
