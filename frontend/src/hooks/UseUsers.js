import { useState, useCallback } from "react";
import { fetchApi } from "../utils/api";

export function useUsers() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetchApi("register/", {
        method: "POST",
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          phone_number: userData.phone_number || "",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ошибка регистрации: ${text}`);
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await fetchApi("login/", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ошибка входа: ${text}`);
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetchApi("logout/", {
        method: "POST",
      });
    } catch (err) {
      console.error("Ошибка выхода:", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetchApi("current-user/", {
        headers: {},
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Ошибка получения пользователя:", err);
    }
  }, [token]);

  const updateProfile = useCallback(
    async (profileData) => {
      if (!token) return;

      try {
        const response = await fetchApi("update-profile/", {
          method: "PUT",
          body: JSON.stringify(profileData),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          return data;
        } else {
          const text = await response.text();
          throw new Error(`Ошибка обновления профиля: ${text}`);
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [token]
  );

  return {
    user,
    token,
    register,
    login,
    logout,
    fetchCurrentUser,
    updateProfile,
  };
}
