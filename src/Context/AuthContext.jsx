/* eslint-disable no-unused-vars */
import { createContext, useContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  permissions: [],
  hasPermission: () => false,
  login: (permissions = [],rememberMe=false) => {},
  logout: () => {},
  toggleLogin: () => {},
  updatePermissions:(permissions =[])=>{},
});


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
