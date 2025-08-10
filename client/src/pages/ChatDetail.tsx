import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import * as signalR from "@microsoft/signalr";
import { MessageSquare, Send } from "lucide-react";
import api from "../lib/api";

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
  const [status, setStatus] = useState<
    "connected" | "reconnecting" | "disconnected"
  >("disconnected");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const chatIdNum = useMemo(() => Number(chatId), [chatId]);
  const canSend =
    newMessage.trim().length > 0 &&
    connection &&
    status === "connected" &&
    !sending;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/chat/${chatId}/messages`);
        setMessages(res.data);
      } catch (err) {
        setError("Failed to load messages.");
        console.error("Failed to load messages:", err);
      }
    };
    if (chatId && token) fetchMessages();
  }, [chatId, token]);

  useEffect(() => {
    const baseUrl =
      (import.meta as unknown).env.VITE_API_URL || "http://localhost:5277";

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/chathub?chatId=${chatId}`, {
        accessTokenFactory: () => localStorage.getItem("token") || "",
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    hub.onreconnecting(() => setStatus("reconnecting"));
    hub.onreconnected(() => setStatus("connected"));
    hub.onclose(() => setStatus("disconnected"));

    hub.on("ReceiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    hub
      .start()
      .then(() => {
        setStatus("connected");
        setConnection(hub);
      })
      .catch((err) => {
        console.error("SignalR connection failed:", err);
        setStatus("disconnected");
        setError("Real-time connection failed.");
      });

    return () => {
      hub.stop();
    };
  }, [chatId, token]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSend || !connection) return;
    try {
      setSending(true);
      await connection.invoke("SendMessage", chatIdNum, newMessage.trim());
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const badge =
    status === "connected"
      ? "bg-emerald-100 text-emerald-700"
      : status === "reconnecting"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
              <MessageSquare className="h-4 w-4" />
              Chat #{chatId}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${badge}`}>
              {status === "connected"
                ? "Online"
                : status === "reconnecting"
                ? "Reconnecting…"
                : "Offline"}
            </span>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm">
          <div
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-slate-600 py-8">
                No messages yet.
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      mine ? "justify-end" : "justify-start"
                    }`}>
                    <div
                      className={[
                        "max-w-[80%] rounded-2xl px-3 py-2",
                        mine
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-900",
                      ].join(" ")}>
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.text}
                      </div>
                      <div
                        className={`mt-1 text-[10px] ${
                          mine ? "text-white/70" : "text-slate-500"
                        }`}>
                        {new Date(msg.sentAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-slate-200/60 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type a message…"
                className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition disabled:opacity-50">
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
