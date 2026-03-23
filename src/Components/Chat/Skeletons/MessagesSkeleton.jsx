const MessagesSkeleton = () => {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {[...Array(8)].map((_, i) => {
        const isMe = i % 2 !== 0;

        return (
          <div
            key={i}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-xl shadow-sm max-w-[75%] ${
                isMe ? "bg-[#03045E]/40 text-white" : "bg-gray-300"
              }`}
            >
              {/* Fake message lines */}
              <div className="space-y-2">
                <div className="h-3 bg-white/60 rounded w-32" />
                <div className="h-3 bg-white/50 rounded w-24" />
              </div>

              {/* Fake timestamp */}
              <div className="flex justify-end mt-2">
                <div className="h-2 w-10 bg-white/50 rounded" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default MessagesSkeleton;
