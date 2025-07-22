import axios from "axios";

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

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(`${API_BASE}/login`, data);
  return res.data;
}
