import * as signalR from "@microsoft/signalr";

export function createChatConnection(chatId: number | string) {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const apiOrigin = apiBase
    ? new URL(apiBase, window.location.origin).origin
    : window.location.origin;

  return new signalR.HubConnectionBuilder()
    .withUrl(
      `${apiOrigin.replace(/\/+$/, "")}/chathub?chatId=${encodeURIComponent(
        String(chatId)
      )}`,
      {
        accessTokenFactory: () => localStorage.getItem("token") || "",
        withCredentials: true,
      }
    )
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
}
