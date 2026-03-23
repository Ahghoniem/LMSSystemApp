import { useReducer, useEffect } from "react";
import { AuthContext } from "./AuthContext";

/* ================= HELPERS ================= */

const getStoredAuth = () => {
  const sessionAuth = sessionStorage.getItem("auth");
  const localAuth = localStorage.getItem("auth");

  if (sessionAuth) return JSON.parse(sessionAuth);
  if (localAuth) return JSON.parse(localAuth);

  return {
    isLoggedIn: false,
    permissions: [],
    rememberMe: false,
  };
};

const saveAuth = (auth) => {
  if (auth.rememberMe) {
    localStorage.setItem("auth", JSON.stringify(auth));
    sessionStorage.removeItem("auth");
  } else {
    sessionStorage.setItem("auth", JSON.stringify(auth));
    localStorage.removeItem("auth");
  }
};

const clearAuth = () => {
  sessionStorage.removeItem("auth");
  localStorage.removeItem("auth");
};

/* ================= REDUCER ================= */

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        isLoggedIn: true,
        permissions: action.payload.permissions ?? [],
        rememberMe: action.payload.rememberMe ?? false,
      };

    case "LOGOUT":
      return {
        isLoggedIn: false,
        permissions: [],
        rememberMe: false,
      };

      case "UPDATE_PERMISSIONS":
        return {
          ...state,
          permissions: action.payload ?? [],
        };

    default:
      return state;
  }
};

/* ================= PROVIDER ================= */

const AuthProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(
    authReducer,
    null,
    getStoredAuth
  );

  useEffect(() => {
    if (authState.isLoggedIn) {
      saveAuth(authState);
    } else {
      clearAuth();
    }
  }, [authState]);
  

  /* ================= ACTIONS ================= */

  const login = (permissions = [], rememberMe = false) => {
    dispatch({
      type: "LOGIN",
      payload: { permissions, rememberMe },
    });
  };

  const logout = () => {
    clearAuth();
    dispatch({ type: "LOGOUT" });
  };

  const updatePermissions = (permissions = []) => {
    dispatch({
      type: "UPDATE_PERMISSIONS",
      payload: permissions,
    });
  };
  

  const hasPermission = (permission) => {
    const userPermissions = authState.permissions;

    if (Array.isArray(permission)) {
      return permission.some((p) => userPermissions.includes(p));
    }

    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        login,
        logout,
        hasPermission,
        updatePermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
