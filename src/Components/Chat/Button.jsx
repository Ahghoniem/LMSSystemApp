import React from 'react'
function Button({onClick,children,onChange,disabled}) {
    return (
        <button
        disabled={disabled}
        onKeyDown={onChange}
        onClick={onClick}
        className="px-4 py-2 bg-[#0077B6] disabled:bg-blue-100 text-white rounded-full hover:bg-[#023E8A] transition-colors"
  >
    {children}
  </button>
    )
}

export default Button
