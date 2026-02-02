import { useAuthStore } from "../store/auth.store";

export const isAccessTokenExpired = () => {
  const { accessTokenExp } = useAuthStore.getState();
  if (!accessTokenExp) return true;

  const now = Math.floor(Date.now() / 1000);
  return accessTokenExp - now < 60;
};

export const decodeExp = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
};