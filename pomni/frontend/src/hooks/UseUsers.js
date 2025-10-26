import { useState, useCallback } from "react";

export function useUsers() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Ошибка выхода:", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [token]);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/current-user/", {
        headers: {
          Authorization: `Token ${token}`,
        },
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
        const response = await fetch(
          "http://127.0.0.1:8000/api/update-profile/",
          {
            method: "PUT",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
          }
        );

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
