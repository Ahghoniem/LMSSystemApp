import { useState, useEffect } from "react";
import { WEB_SOCKET_URL } from "../Constants";

let globalWs;
let globalListeners = [];

export function useWebSocket(url = WEB_SOCKET_URL, userId) {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(0);

  if (!globalWs || globalWs.readyState === WebSocket.CLOSED) {
    globalWs = new WebSocket(url);

    globalWs.onopen = () => console.log("WebSocket connected");
    globalWs.onclose = () => console.log("WebSocket disconnected");
    globalWs.onerror = (err) => console.error("WebSocket error:", err);

    globalWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      globalListeners.forEach((listener) => listener(data));
    };
  }

  useEffect(() => {
    const listener = (data) => {
      setMessages((prev) => [...prev, data]);
      if (data.id.includes(userId) && data.data !=="message") setChat((prev) => prev + 1);
    };

    globalListeners.push(listener);

    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
    };
  }, [userId]);

  const sendMessage = (data) => {
    if (globalWs.readyState === WebSocket.OPEN) globalWs.send(JSON.stringify(data));
  };

  return [messages, sendMessage, chat,setChat];
}
