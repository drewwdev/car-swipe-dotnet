import axios from "axios";
import api from "../lib/api";
import type { User } from "../types/User";

const API_BASE = "http://localhost:5277/api";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post<LoginResponse>("/api/auth/login", payload);
  return res.data;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  location: string;
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const res = await axios.post(`${API_BASE}/auth/register`, data);
  return res.data;
}
