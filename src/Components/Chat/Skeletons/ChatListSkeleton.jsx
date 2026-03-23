const ChatListSkeleton = () => {
    return (
      <div className="animate-pulse">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-200"
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  };

export default ChatListSkeleton