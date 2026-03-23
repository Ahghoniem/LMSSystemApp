
function MessageStatus({ status }) { 
   
    if (status === "sent") {
      return <span className="font-semibold text-sm">✓</span>;
    } else if (status === "delivered") {
      return <span className="font-semibold text-sm">✓<span className="statusMargin">✓</span></span>;
    } else if (status === "seen") {
      return <span className="font-semibold text-sm text-blue-400">✓<span className="statusMargin text-blue-400">✓</span></span>; // WhatsApp blue
    } else {
      return null;
    }
  }

export default MessageStatus;