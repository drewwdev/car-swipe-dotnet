import api from "../lib/api";
import type { User } from "../types/User";

export interface LoginResponse {
  user: User;
  token: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export async function login(payload: LoginRequest) {
  const res = await api.post<LoginResponse>("login", payload);
  return res.data;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  location: string;
}
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("register", data);
  return res.data;
}
