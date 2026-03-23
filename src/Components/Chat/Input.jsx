import React from 'react'
function Input(props) {
    return (
        <input
        {...props}
        className="flex-1 px-4 py-2 border border-[#ccc] bg-white text-[#333] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0077B6] chattingInput"
      />
    )
}

export default Input
