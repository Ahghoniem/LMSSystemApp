export function formatMessageTime(input, lang = "en") {
    const messageDate = new Date(input);
    const now = new Date();  
    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  
    const isYesterday = (d1, d2) => {
      const yesterday = new Date(d2);
      yesterday.setDate(d2.getDate() - 1);
      return isSameDay(d1, yesterday);
    };
  
    const labels = {
      en: { yesterday: "Yesterday" },
      ar: { yesterday: "الأمس" }
    };
  
    if (isSameDay(messageDate, now)) {
      return messageDate.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (isYesterday(messageDate, now)) {
      return labels[lang]?.yesterday || labels.en.yesterday;
    } else {
      return messageDate.toLocaleDateString(lang, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    }
  }
  

  export function getExactTime(timestamp, lang = "en") {
    try {
      const date = new Date(timestamp);
  
      let hours = date.getHours();
      let minutes = date.getMinutes().toString().padStart(2, "0");
  
      // Determine AM/PM (English) or Arabic م / ص
      let period;
  
      if (lang === "ar") {
        period = hours >= 12 ? "م" : "ص"; // Arabic
      } else {
        period = hours >= 12 ? "PM" : "AM"; // English
      }
  
      // Convert to 12-hour format
      hours = hours % 12 || 12;
  
      return `${hours}:${minutes} ${period}`;
    } catch (error) {
      console.log(error);
      return timestamp;
    }
  }
  
  export function getExactTime2(timestamp) {
      try {
        
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      } catch (error) {
        console.log(error);
        
        return timestamp;
      }
    }

    export const normalizeMessage = (msg) => {
        if (msg.senderId) {
          return {
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            time: msg.time,
            status: msg.status,
            type:msg.type,
            duration:msg.duration,
            senderName:msg.senderName
          };
        } else {
          return {
            id: msg.messageId,
            content: msg.content,
            senderId: msg.sender.userId,
            time: msg.sentAt,
            status: msg.status,
            type:msg.type,
            duration:msg.duration,
            senderName:msg.senderName
          };
        }
      };
      export const updateChatAndSort = (chatId, newMessage, newTime, status,setChatList,type="text") => {
        setChatList((prev) => {
          const updatedResults = prev.map((chat) => {
            if (chat.conversationId === chatId) {
              return {
                ...chat,
                lastMessage: {
                  ...chat.lastMessage,
                  content: newMessage,
                  sentAt: newTime,
                  status: status,
                  type:type
                },
              };
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
      };
