import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import PostImage from "../components/PostImage";
import { MessageSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  sentAt: string;
}

interface ChatPost {
  title: string;
  imageUrls?: string[];
}

interface Chat {
  id: number;
  buyerId: number;
  sellerId: number;
  post: ChatPost;
  messages?: Message[];
}

export default function Chats() {
  const { token } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/chat/me");
        setChats(res.data);
      } catch (err) {
        setError("Failed to load chats.");
        console.error("❌ Failed to fetch chats:", err);
      }
    };
    if (token) fetchChats();
  }, [token]);

  const sorted = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aTime =
        a.messages && a.messages.length
          ? new Date(a.messages[a.messages.length - 1].sentAt).getTime()
          : 0;
      const bTime =
        b.messages && b.messages.length
          ? new Date(b.messages[b.messages.length - 1].sentAt).getTime()
          : 0;
      return bTime - aTime;
    });
  }, [chats]);

  const openConfirm = (id: number) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setDeleting(true);
    try {
      await api.delete(`/chat/${pendingId}`);
      setChats((prev) => prev.filter((c) => c.id !== pendingId));
      toast.success("Chat deleted");
      setConfirmOpen(false);
    } catch (err) {
      console.error("❌ Failed to delete chat:", err);
      setError("Failed to delete chat.");
      toast.error("Failed to delete chat");
    } finally {
      setDeleting(false);
      setPendingId(null);
    }
  };

  const preview = (c: Chat) => {
    if (!c.messages || c.messages.length === 0) return "No messages yet";
    const last = c.messages[c.messages.length - 1];
    return last.text.length > 80 ? last.text.slice(0, 80) + "…" : last.text;
  };

  const timeAgo = (c: Chat) => {
    if (!c.messages || c.messages.length === 0) return "";
    const t = new Date(c.messages[c.messages.length - 1].sentAt).getTime();
    const d = Date.now() - t;
    if (d < 0) return "";
    const m = Math.floor(d / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
            <MessageSquare className="h-4 w-4" /> Chats
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
            Your Conversations
          </h2>
          <p className="mt-1 text-slate-600">Continue where you left off.</p>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {sorted.length === 0 ? (
          <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-8 text-center shadow-sm">
            <p className="text-slate-700">No chats yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sorted.map((chat) => (
              <div
                key={chat.id}
                className="flex items-stretch gap-3 rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm overflow-hidden">
                <Link
                  to={`/chats/${chat.id}`}
                  className="flex-1 flex items-center">
                  <div className="w-28 h-20 shrink-0">
                    <PostImage
                      urls={chat.post?.imageUrls}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-slate-900 font-semibold line-clamp-1">
                        {chat.post?.title ?? "Post"}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {timeAgo(chat)}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-600 text-sm line-clamp-1">
                      {preview(chat)}
                    </div>
                    <div className="mt-1 text-slate-500 text-xs">
                      Chat ID: {chat.id}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center p-3">
                  <button
                    onClick={() => openConfirm(chat.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50 transition">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setConfirmOpen(false)}
          />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete this chat?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              This will remove the conversation for you.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition disabled:opacity-50">
                {deleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
