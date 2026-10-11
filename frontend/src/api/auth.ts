import api from './client';
import type { AuthResponse, User } from '../types';

export async function loginRequest(
  usernameOrEmail: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/users/login', {
    usernameOrEmail,
    password,
  });
  return data;
}

export async function registerRequest(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/users/register', {
    username,
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}
