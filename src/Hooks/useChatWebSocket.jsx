import { useEffect, useRef, useState } from "react";
import axiosInstance from "../Constants/axiosInstance";
import { WEB_SOCKET_URL } from "../Constants";

export default function useChat(userId) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [onlineUsers, setOnlineusers] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(WEB_SOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "register", userId }));
      console.log("Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { id } = data;

      if (data.data.type === "message") {
        // handle text or voice
        setMessages((prev) => ({
          ...prev,
          [id]: [
            ...(prev[id] || []),
            {
              id: data.data.id,
              content: data.data.content || data.data.message,
              type: data.data.messageType || "text",
              duration: data.data.duration || null,
              senderId: data.data.senderId,
              senderName:data.data.senderName,
              time: data.data.messageTime,
              status: data.data.isDelivered ? "delivered" : "sent",
            },
          ],
        }));

        setUnreadMessages((prev) => ({
          ...prev,
          [id]: (prev[id] || 0) + 1,
        }));
      }

      if (data.data.type === "delivered") {
        setMessages((prev) => ({
          ...prev,
          [id]: prev[id]?.map((msg) =>
            msg.id === data.data.message
              ? { ...msg, status: "delivered" }
              : msg
          ) || [],
        }));
      }

      if (data.data.type === "online") {
        setOnlineusers((prev) => [...prev, data.id]);
      }

      if (data.data.type === "offline") {
        setOnlineusers((prev) => prev.filter((uid) => uid !== data.id));
      }

      if (data.data.type === "seen") {
        const updatedMessageIds = data.data.messages;
        setMessages((prev) => ({
          ...prev,
          [id]: prev[id]?.map((msg) => {
            const updated = updatedMessageIds.find(u => u.messageId === msg.id);
            return updated ? { ...msg, ...updated } : msg;
          }) || [],
        }));
      }
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  // ===============================
  // 5. SEND MESSAGE (text or voice)
  // ===============================
  const sendMessage = async (conversationId, content, options = {}) => {
    try {
      let messageData;
      if (options.type === "voice" && options.file) {
        const formData = new FormData();
        formData.append("voice", options.file, `voice-${Date.now()}.webm`);
        formData.append("conversationId", conversationId);
        formData.append("type", "voice");
        formData.append("senderId", options.id);
        if (options.duration) formData.append("duration", options.duration);
        formData.append("senderName",options.senderName);
        formData.append("message", `voice-${Date.now()}.webm`);

        const res = await axiosInstance.post("/chat/voice", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        messageData = res.data.data;
      } else {
        const res = await axiosInstance.post(`/chat/messages`, {
          message: content,
          senderId: userId,
          conversationId,
          senderName:options.senderName
        });
        messageData = res.data.data;
      }
      

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [
          ...(prev[conversationId] || []),
          {
            id: messageData.messageId,
            content: messageData.content,
            senderId: messageData.senderId,
            time: messageData.sentAt,
            status: messageData.status,
            type:messageData.type,
            duration:messageData.duration,
            senderName:messageData.senderName
          },
        ],
      }));

      return messageData.status;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // ===============================
  // 6. MARK MESSAGES SEEN VIA WEBSOCKET
  // ===============================
  const markSeen = (conversationId) => {
    if (!socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({ type: "seen", conversationId, userId })
    );
  };

  return { messages, sendMessage, markSeen, unreadMessages, onlineUsers, setOnlineusers };
}
