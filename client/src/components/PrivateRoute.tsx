import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface Props {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: Props) {
  const { user, token } = useAuth();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
