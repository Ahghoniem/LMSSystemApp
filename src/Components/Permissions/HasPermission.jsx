import { useAuth } from "../../Context/AuthContext";


const HasPermission = ({ permission, children }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) return null;

  return <>{children}</>;
};

export default HasPermission;
