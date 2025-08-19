import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import * as signalR from "@microsoft/signalr";
import { MessageSquare, Send } from "lucide-react";
import api from "../lib/api";
import { isAxiosError } from "../lib/http";

interface Message {
  id: number;
  senderId: number;
  text: string;
  sentAt: string;
}

interface ChatMeta {
  id: number;
  buyerId: number;
  sellerId: number;
  postId: number;
  post?: {
    id: number;
    userId: number;
    status: number | string;
    price?: number;
  };
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

  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null);
  const [soldBanner, setSoldBanner] = useState<{
    amount: number;
    when: string;
  } | null>(null);

  const [saleOpen, setSaleOpen] = useState(false);
  const [saleAmount, setSaleAmount] = useState<string>("");
  const [closingSale, setClosingSale] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const chatIdNum = useMemo(() => Number(chatId), [chatId]);
  const canSend =
    newMessage.trim().length > 0 &&
    connection &&
    status === "connected" &&
    !sending &&
    !soldBanner;

  const isPostSold = (meta?: ChatMeta | null) => {
    const s = meta?.post?.status;
    if (s === undefined || s === null) return false;
    return s === "Sold" || s === 1;
  };

  const iAmSeller = chatMeta && user ? chatMeta.sellerId === user.id : false;
  const showMarkAsSold =
    !!chatMeta && iAmSeller && !isPostSold(chatMeta) && !soldBanner;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${chatId}/messages`);
        setMessages(res.data);
      } catch (err: unknown) {
        console.error("Failed to load messages:", err);

        let msg = "Failed to load messages.";
        if (isAxiosError(err)) {
          const data = err.response?.data as { message?: string } | undefined;
          msg = data?.message ?? err.message ?? msg;
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setError(msg);
      }
    };

    const fetchMeta = async () => {
      try {
        const res = await api.get("/chat/me");
        const meta: ChatMeta | undefined = (res.data as ChatMeta[]).find(
          (c) => c.id === chatIdNum
        );
        if (meta) {
          setChatMeta(meta);
          if (isPostSold(meta)) {
            setSoldBanner({ amount: 0, when: new Date().toISOString() });
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load chat meta:", err);
      }
    };
    if (chatId && token) {
      fetchMessages();
      fetchMeta();
    }
  }, [chatId, token, chatIdNum]);

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(
      /\/+$/,
      ""
    );

    const hubBase = /\/api$/i.test(apiBase)
      ? ""
      : (apiBase || window.location.origin).replace(/\/+$/, "");

    const hubUrl = `${hubBase}/chathub?chatId=${chatId}`;

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
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
    } catch (err: unknown) {
      console.error("Failed to send message:", err);

      let msg = "Failed to send message.";
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        msg = data?.message ?? err.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleCloseSale = async () => {
    if (!saleAmount) return;
    try {
      setClosingSale(true);
      const amountNum = Number(saleAmount);
      if (Number.isNaN(amountNum) || amountNum < 0) {
        setError("Enter a valid amount.");
        setClosingSale(false);
        return;
      }
      await api.post(`/chat/${chatId}/close-sale`, { amount: amountNum });
      setSoldBanner({ amount: amountNum, when: new Date().toISOString() });
      setSaleOpen(false);
    } catch (err: unknown) {
      console.error("Close sale failed:", err);

      let msg = "Failed to mark as sold.";
      if (isAxiosError(err)) {
        if (err.response?.status === 403) {
          msg = "Only the seller can mark this as sold.";
        } else if (err.response?.status === 409) {
          msg = "Already sold.";
        } else {
          const data = err.response?.data as { message?: string } | undefined;
          msg = data?.message ?? err.message ?? msg;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setClosingSale(false);
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
            <div className="flex items-center gap-2">
              {showMarkAsSold && (
                <button
                  onClick={() => {
                    setSaleAmount(String(chatMeta?.post?.price ?? ""));
                    setSaleOpen(true);
                  }}
                  className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs hover:opacity-90">
                  Mark as Sold
                </button>
              )}
              <span className={`rounded-full px-3 py-1 text-xs ${badge}`}>
                {status === "connected"
                  ? "Online"
                  : status === "reconnecting"
                  ? "Reconnecting…"
                  : "Offline"}
              </span>
            </div>
          </div>

          {soldBanner && (
            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 text-sm">
              Sold{" "}
              {soldBanner.amount
                ? `for $${soldBanner.amount.toLocaleString()}`
                : ""}{" "}
              on {new Date(soldBanner.when).toLocaleString()}
            </div>
          )}

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
                placeholder={soldBanner ? "Item is sold." : "Type a message…"}
                disabled={!!soldBanner}
                className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none disabled:opacity-60"
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

      {saleOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">Mark as Sold</h3>
            <p className="text-sm text-slate-600 mt-1">
              Enter the final amount to record the sale.
            </p>
            <div className="mt-3">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="e.g. 12750.00"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSaleOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm"
                disabled={closingSale}>
                Cancel
              </button>
              <button
                onClick={handleCloseSale}
                className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-sm disabled:opacity-60"
                disabled={closingSale || !saleAmount}>
                {closingSale ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
