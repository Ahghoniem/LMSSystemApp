// src/Styles/reactSelectStyles.js

export const reactSelectGlobalStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "8px",
      borderColor: state.isFocused ? "var(--gold)" : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 1px var(--gold)" : "none",
      "&:hover": {
        borderColor: "var(--gold)",
      },
      minHeight: "36px",
      fontFamily: "var(--font-family)",
      fontSize: "14px",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "8px",
      marginTop: "4px",
      zIndex: 10,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? "var(--gold)"
        : isFocused
        ? "#f3f3f3"
        : "white",
      color: isSelected ? "white" : "black",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#aaa",
      fontFamily:"'Cairo',san-serif",
      fontSize:"17px"
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? "var(--gold)" : "#666",
      "&:hover": {
        color: "var(--gold)",
      },
    }),
  };
  export const smallSelectStyles = {
    
    ...reactSelectGlobalStyles,
    placeholder:(base) => ({ ...base, fontSize: "15px" })
  };
  