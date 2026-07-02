import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const TOKEN_KEY = "dsa_league_token";

export function useAuth() {
  const [token, setToken] = useState(Cookies.get(TOKEN_KEY) || null);

  useEffect(() => {
    const stored = Cookies.get(TOKEN_KEY);
    if (stored !== token) {
      setToken(stored || null);
    }
  }, [token]);

  const saveToken = (value, remember) => {
    if (remember) {
      Cookies.set(TOKEN_KEY, value, { expires: 7 });
    } else {
      Cookies.set(TOKEN_KEY, value);
    }
    setToken(value);
  };

  const clearToken = () => {
    Cookies.remove(TOKEN_KEY);
    setToken(null);
  };

  return { token, saveToken, clearToken };
}
