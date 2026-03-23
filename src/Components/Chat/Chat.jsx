/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useMemo } from "react";
import Input from "./Input";
import Button from "./Button";
import MessageStatus from "./Status";
import toast, { Toaster } from "react-hot-toast";

import "./tailwind.css";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../Constants/axiosInstance";
import { Decode_Token, getLang, getToken, splitLang } from "../../Utils";
import { useFetchData } from "../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../Constants";
import useChat from "../../Hooks/useChatWebSocket";
import {
  formatMessageTime,
  getExactTime,
  normalizeMessage,
  updateChatAndSort,
} from "./FormatTimeAndDate";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { LucideHeadphones, Mic } from "lucide-react";
import VoiceMessage from "./VoiceMessage";
import ChatListSkeleton from "./Skeletons/ChatListSkeleton";
import ChatHeaderSkeleton from "./Skeletons/ChatHeaderSkeleton";
import MessagesSkeleton from "./Skeletons/MessagesSkeleton";
const ResponsiveChatApp = () => {
  const [messages, setMessages] = useState([]);
  const { t } = useTranslation("chat");
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const [chatList, setChatList] = useState([]);
  const token = getToken();
  const tokenData = Decode_Token(token);
  const [loading, setIsLoading] = useState(false);
  const lang = getLang();
  const [pageState, setPageState] = useState(0);
  const [showPeopleList, setShowPeopleList] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [, setAudioBlob] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const {
    messages: msg,
    sendMessage: sent,
    unreadMessages,
    onlineUsers,
    setOnlineusers,
  } = useChat(tokenData.id);

  const { data: online } = useFetchData({
    baseUrl: `${API_BASE_URL}chat/users/online`,
    queryKey: ["onlineUsers"],
    token,
  });
  useEffect(() => {
    if (online?.data) {
      setOnlineusers((prev) => [...new Set([...prev, ...online.data])]);
    }
  }, [online]);
  const onlineUsersSet = useMemo(() => {
    return new Set(onlineUsers);
  }, [onlineUsers]);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        chunks = [];
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const sendVoiceNote = async (conversationId, blob) => {
    if (!blob) return;

    try {
      const duration = Math.floor(blob.size / 10000);
      new Date();
      const newMessage = await sent(conversationId, "Voice Note", {
        type: "voice",
        file: blob,
        duration,
        id: tokenData.id,
        senderName: tokenData.NameEn ?? tokenData.name,
      });
      updateChatAndSort(
        conversationId,
        "Voice Note",
        new Date().toString(),
        newMessage ?? "sent",
        setChatList,
        "voice"
      );
      setAudioBlob(null);
    } catch (err) {
      console.error("Failed to send voice note:", err);
    }
  };

  const stopRecording = (conversationId) => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    mediaRecorderRef.current.ondataavailable = async (event) => {
      const blob = event.data;
      if (!blob) return;
      setAudioBlob(blob);
      await sendVoiceNote(conversationId, blob);
    };
  };

  const getCombinedMessages = (conversationId) => {
    const hookMessages = (msg[conversationId] || []).map(normalizeMessage);
    const existingMessages = (messages || []).map(normalizeMessage);
    const all = [...existingMessages, ...hookMessages];
    const dedupedMap = new Map();
    all.forEach((m) => {
      dedupedMap.set(m.id, m);
    });
    const combined = Array.from(dedupedMap.values());
    combined.sort((a, b) => new Date(a.time) - new Date(b.time));
    return combined;
  };

  const { data, isLoading } = useFetchData({
    baseUrl: `${API_BASE_URL}chat/conversations`,
    queryKey: ["chats", pageState],
    token,
  });
  useEffect(() => {
    if (data?.data) {
      const sorted = [...data.data].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.sentAt || 0);
        const timeB = new Date(b.lastMessage?.sentAt || 0);
        return timeB - timeA;
      });

      setChatList(sorted);
    }
  }, [data]);

  const AddChat = async (id) => {
    const usersIds = [tokenData.id, id];
    if (loading) return;
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("chat/conversations/direct", {
        usersIds: usersIds,
      });
      console.log(res.data.data);
      setIsLoading(false);
      setPageState(pageState + 1);
      toast.success(t("Conversation created succssfully"), {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
        duration: 4000,
      });
      setShowPeopleList(false);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response.data.errors[0], {
        position: "top-center",
        style: { backgroundColor: "red", color: "white" },
        duration: 4000,
      });
    }
  };

  const sendMessage = async (conversationId, content) => {
    if (message) {
      try {
        setIsLoading(true);
        const stat = await sent(conversationId, content, {
          senderName: tokenData.NameEn ?? tokenData.name,
        });
        const now = new Date();
        updateChatAndSort(
          conversationId,
          content,
          now.toString(),
          stat,
          setChatList
        );
        setMessage("");
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
        if (error.message === "Network Error") {
          toast.error(t("NetworkError"), {
            position: "top-center",
            style: { backgroundColor: "red", color: "white" },
            duration: 4000,
          });
        }
      }
    }
  };

  const getMessages = async (id) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`chat/conversations/${id}/messages`);
      let ress = [];
      ress = [...res.data.data.data];
      setMessages(ress);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("chat/my-people");
      setUsers(res.data.data.data);
      setShowPeopleList(true);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error.message === "Network Error") {
        toast.error(t("NetworkError"), {
          position: "top-center",
          style: { backgroundColor: "red", color: "white" },
          duration: 4000,
        });
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedChat) {
        setMessages([]);
        setShowMembers(false);
        setSelectedChat(null);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, selectedChat]);

  const getGroupMembers = async (conversationId) => {
    try {
      const res = await axiosInstance.get(
        `chat/conversations/${conversationId}/members`
      );
      console.log(res.data.data);
      return res.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };
  const handleChat = async (id, chat) => {
    if (loading) return;

    // 1️⃣ Open immediately (instant UI response)
    setSelectedChat({ ...chat, members: chat.members || [] });
    setMessages([]);
    setMessagesLoading(true);

    window.history.pushState({ page: "chat" }, "Chat", window.location.href);

    // 2️⃣ Fetch group members (non-blocking)
    if (chat.type === "group") {
      getGroupMembers(id)
        .then((members) => {
          setSelectedChat((prev) =>
            prev?.conversationId === id ? { ...prev, members } : prev
          );
        })
        .catch(console.log);
    }

    // 3️⃣ Fetch messages (main loading control)
    getMessages(id)
      .then((res) => {
        setMessages(res.data.data.data);
      })
      .catch(console.log)
      .finally(() => {
        setMessagesLoading(false);
      });

    // 4️⃣ Mark as seen (background task)
    axiosInstance
      .put(`chat/messages/seen`, {
        conversationId: id,
        receiverId: tokenData.id,
      })
      .then(() => {
        unreadMessages[id] = 0;
      })
      .catch(console.log);
  };

  useEffect(() => {
    if (!msg) return;
    Object.entries(msg).forEach(([conversationId, messagesArray]) => {
      if (!messagesArray || messagesArray.length === 0) return;
      const lastMsg = messagesArray[messagesArray.length - 1];
      setChatList((prev) => {
        const updatedResults = prev.map((chat) => {
          if (chat.conversationId === conversationId) {
            const currentLastTime = chat.lastMessage?.sentAt;
            const newLastTime = lastMsg.time || lastMsg.sentAt;
            if (
              !currentLastTime ||
              new Date(newLastTime) > new Date(currentLastTime)
            ) {
              return {
                ...chat,
                lastMessage: {
                  ...chat.lastMessage,
                  content: lastMsg.content,
                  sentAt: newLastTime,
                  status: lastMsg.status,
                  senderId: lastMsg.senderId,
                },
              };
            }
          }
          return chat;
        });
        updatedResults.sort((a, b) => {
          const tA = new Date(a.lastMessage?.sentAt || 0);
          const tB = new Date(b.lastMessage?.sentAt || 0);
          return tB - tA;
        });
        return updatedResults;
      });
    });
  }, [msg]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && message.trim() && !loading) {
      sendMessage(selectedChat.conversationId, message);
      e.preventDefault();
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const current = selectedChat
    ? getCombinedMessages(selectedChat.conversationId)
    : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleBack = () => {
      setSelectedChat(null);
      setMessages([]);
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [message, current]);

  const show = () => {
    setShowMembers(true);
  };

  return (
    <div className={`h-[82vh] bg-[#f0f0f0]`}>
      <div className="flex h-full mt-18 test">
        {(!isMobile || selectedChat === null) && (
          <div className="w-full md:w-full sm:max-w-sm bg-white border-r border-[#ccc] flex flex-col">
            <div className="px-4 py-4 text-xl font-bold  text-[#03045E] border-b border-[#ccc]">
              {t("title")}
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <ChatListSkeleton />
              ) : (
                chatList?.map((chat) => (
                  <motion.div
                    key={chat.conversationId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleChat(chat.conversationId, chat)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-b-gray-200 hover:bg-[#f1f1f1] ${
                      selectedChat?.conversationId === chat.conversationId &&
                      !isMobile
                        ? "bg-[#e0f2ff]"
                        : ""
                    }`}
                  >
                    <img
                      src={
                        chat.type === "direct"
                          ? "/blank-profile-picture-973460_1920.png"
                          : "/ChatGPT Image Nov 16, 2025, 11_42_43 PM.png"
                      }
                      alt={chat.name}
                      className="rounded-full w-10 h-10 object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex w-full items-center justify-between">
                        <div className="font-semibold text-[#111]">
                          {chat.type === "direct"
                            ? lang === "ar"
                              ? splitLang(chat.chatWith).ar || chat.chatWith
                              : splitLang(chat.chatWith).en || chat.chatWith
                            : lang === "ar"
                            ? splitLang(chat.name).ar ?? chat.name
                            : splitLang(chat.name).en ?? chat.name}
                        </div>
                        {chat.lastMessage && (
                          <div className="text-sm text-[#707070] ">
                            {formatMessageTime(chat.lastMessage.sentAt, lang)}
                          </div>
                        )}
                      </div>
                      {chat.lastMessage ? (
                        <div
                          className={`text-sm ${
                            unreadMessages[chat.conversationId] > 0
                              ? "flex justify-between mt-2 items-center"
                              : null
                          } truncate max-w-[140px] flex sm:max-w-40  md:max-w-[220px] lg:max-w-[300px]  text-[#707070]`}
                        >
                          {chat.lastMessage.senderId !== tokenData.id ? null : (
                            <MessageStatus status={chat.lastMessage.status} />
                          )}
                          <span className="flex items-center gap-1 text-gray-500 text-sm lastMessageMargin">
                            {chat.lastMessage.type === "text" ? (
                              chat.lastMessage.content
                            ) : (
                              <>
                                <LucideHeadphones
                                  className="text-gray-400"
                                  size={14}
                                />
                                <span>{t("voice")}</span>
                              </>
                            )}
                          </span>
                          {unreadMessages[chat.conversationId] > 0 &&
                            selectedChat?.conversationId !==
                              chat.conversationId && (
                              <div className="mt-1">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
                                  {unreadMessages[chat.conversationId]}
                                </span>
                              </div>
                            )}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
        {(!isMobile || selectedChat) && (
          <div
            className={`flex flex-col bg-[#f0f0f0] ${
              isMobile ? "w-full" : "flex-1"
            }`}
            style={
              selectedChat && {
                background: `linear-gradient(rgba(0, 0, 0, 0.1)), url("/8c98994518b575bfd8c949e91d20548b.jpg")`,
              }
            }
          >
            {selectedChat &&
              (messagesLoading ? (
                <ChatHeaderSkeleton />
              ) : (
                <div className="p-3 flex items-center gap-3 bg-gray-100 border-t-2 border-t-gray-200 border-[#ccc]">
                  {isMobile && (
                    <button
                      onClick={handleBack}
                      className="p-2 mr-1 text-[#03045E]"
                    >
                      ←
                    </button>
                  )}

                  <img
                    src={
                      selectedChat.type === "direct"
                        ? "/blank-profile-picture-973460_1920.png"
                        : "/ChatGPT Image Nov 16, 2025, 11_42_43 PM.png"
                    }
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <div className="font-semibold text-[#03045E]">
                      {selectedChat.type === "direct"
                        ? lang === "ar"
                          ? splitLang(selectedChat.chatWith).ar ||
                            selectedChat.chatWith
                          : splitLang(selectedChat.chatWith).en ||
                            selectedChat.chatWith
                        : lang === "ar"
                        ? splitLang(selectedChat.name).ar ?? selectedChat.name
                        : splitLang(selectedChat.name).en ?? selectedChat.name}
                    </div>
                    <div className="text-gray-400 text-sm flex overflow-hidden  cursor-pointer ">
                      {selectedChat.type === "direct" &&
                        (onlineUsersSet.has(selectedChat.chatWithId)
                          ? "Online"
                          : "Offline")}

                      {selectedChat.type === "group" &&
                        selectedChat.members && (
                          <span
                            className="text-sm text-gray-500"
                            onClick={show}
                          >
                            {selectedChat?.members
                              .map((m) =>
                                m.user?.userId === tokenData.id
                                  ? "Me"
                                  : m.user?.Student?.NameEn ||
                                    splitLang(m.user?.trainer?.Name).en ||
                                    splitLang(m.user?.supervisor?.Name).en ||
                                    m.user?.trainer?.Name ||
                                    "Unknown"
                              )
                              .join(",\t")}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            <div className="flex-1 w-full overflow-x-hidden overflow-y-auto  p-4 md:p-6 space-y-2">
              {messagesLoading ? (
                <MessagesSkeleton />
              ) : (
                current.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl w-fit shadow-sm ${
                      msg.senderId === tokenData.id
                        ? "bg-[#03045E] text-white self-end ml-auto"
                        : "bg-white text-[#333] self-start mr-auto"
                    }`}
                  >
                    {selectedChat.type === "group" &&
                      msg.senderId !== tokenData.id && (
                        <div className="text-[13px] font-semibold mb-1 text-green-800">
                          {splitLang(msg.senderName).en ?? msg.senderName}
                        </div>
                      )}

                    <div className="flex items-end">
                      {msg.type === "text" ? (
                        <div className="MessageLength">{msg.content}</div>
                      ) : (
                        <VoiceMessage
                          audioSrc={msg.content}
                          senderid={msg.senderId}
                          tokenId={tokenData.id}
                        />
                      )}

                      <div
                        className={`text-[11px] ${
                          msg.senderId === tokenData.id && "min-w-[60px]"
                        } flex items-center ${
                          msg.senderId === tokenData.id
                            ? "text-white"
                            : "text-gray-700"
                        } msgMargin text-right`}
                      >
                        {getExactTime(msg.time, lang)}
                        <p className="msgStatusMargin">
                          {msg.senderId === tokenData.id && (
                            <MessageStatus status={msg.status} />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef}></div>
              {!selectedChat && (
                <div className="h-full flex items-center justify-center text-[#707070] text-sm">
                  {t("desc")}
                </div>
              )}
            </div>

            {selectedChat && (
              <div className="p-4 border-t border-[#ccc] bg-white flex gap-2">
                <Input
                  placeholder={t("inputPlaceHolder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {message.trim() ? (
                  <Button
                    disabled={loading}
                    onClick={() =>
                      sendMessage(selectedChat.conversationId, message)
                    }
                  >
                    {loading ? (
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      t("Send")
                    )}
                  </Button>
                ) : (
                  <button
                    onClick={() => {
                      if (isRecording) {
                        stopRecording(selectedChat.conversationId);
                      } else {
                        startRecording();
                      }
                      setIsRecording(!isRecording);
                    }}
                    className="p-3 rounded-full bg-blue-500 text-white"
                  >
                    {isRecording ? "Recording..." : <Mic />}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {showMembers && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg space-y-4 shadow-lg p-4 w-64">
              <h3 className="font-bold mb-2 text-[#03045E] text-center">
                {t("GpMembers")}
              </h3>

              <ul className="max-h-40 space-y-2 overflow-y-auto">
                {selectedChat.members.map((m, i) => (
                  <li key={i} className="py-1 text-gray-700">
                    {m.user?.userId === tokenData.id
                      ? lang === "ar"
                        ? "أنا"
                        : "Me"
                      : lang === "ar"
                      ? m.user?.Student?.fullName ||
                        splitLang(m.user?.trainer?.Name).ar ||
                        splitLang(m.user?.supervisor?.Name).ar ||
                        m.user?.trainer?.Name ||
                        m.user?.supervisor?.Name ||
                        "غير معروف"
                      : m.user?.Student?.NameEn ||
                        splitLang(m.user?.trainer?.Name).en ||
                        splitLang(m.user?.supervisor?.Name).en ||
                        m.user?.trainer?.Name ||
                        m.user?.supervisor?.Name ||
                        "Unknown"}
                  </li>
                ))}
              </ul>
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setShowMembers(false)}
                  className="p-1 text-white bg-gray-600 cursor-pointer min-w-[90px] hover:bg-gray-500 rounded-md"
                >
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {!selectedChat && (
        <>
          <button
            onClick={getUsers}
            disabled={loading}
            className={`fixed bottom-6 btn bg-[#03045E] disabled:bg-[#4e4f7d] [@media_(width<=1180px)]:bottom-11 [@media_(width<=778px)]:bottom-18 hover:bg-[#4e4f7d] w-13 h-13 cursor-pointer text-white  rounded-full shadow-lg text-2xl`}
          >
            {loading ? (
              <div
                className={
                  "animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                }
              ></div>
            ) : (
              "+"
            )}
          </button>

          {showPeopleList && (
            <div className="fixed inset-0 backdrop-blur-xs bg-opacity-30 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-4 w-80 max-h-[60vh] overflow-y-auto shadow-md">
                <div className="text-lg font-semibold mb-3 text-[#03045E]">
                  {t("startChat")}
                </div>
                {users.map((person) => (
                  <div
                    key={person.userId}
                    onClick={() => AddChat(person.userId)}
                    className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#f1f1f1] rounded"
                  >
                    <img
                      src={"/blank-profile-picture-973460_1920.png"}
                      alt={person.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-[#111] font-medium">
                      {person.fullName}
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setShowPeopleList(false)}
                    className="p-2 text-white bg-gray-600 cursor-pointer hover:bg-gray-500 rounded-md"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <Toaster />
    </div>
  );
};

export default ResponsiveChatApp;
