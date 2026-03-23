const ChatHeaderSkeleton = () => {
    return (
      <div className="p-3 flex items-center gap-3 bg-gray-100 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    );
  };

export default ChatHeaderSkeleton