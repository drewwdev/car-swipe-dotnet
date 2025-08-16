import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const { user, token } = useAuth();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
