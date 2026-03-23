import { createContext, useContext } from "react";

export const TokenContext=createContext({
  token:"",
  getToken:() => {},
  deleteToken:() => {}
})

export const useToken = () => {
    const context = useContext(TokenContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
  