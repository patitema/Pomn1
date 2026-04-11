import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useUsers } from "../../hooks/UseUsers";
import "./Profile.css";

export default function Profile() {
  document.title = "POMNI";
  const { user, logout, fetchCurrentUser, updateProfile } = useUsers();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone_number: "",
  });

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      alert("Профиль обновлен");
    } catch (err) {
      alert("Ошибка обновления: " + err.message);
    }
  };

  return (
    <div>
      <Nav></Nav>
      <main>
        <div className="main-container">
          <h1>Личный кабинет</h1>
          {user ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <label>
                Логин:
                <input
                  type="text"
                  name="username"
                  value={user.username}
                  readOnly
                />
              </label>
              <label>
                Почта:
                <input
                  type="text"
                  name="email"
                  value={user.email || ""}
                  readOnly
                />
              </label>
              <label>
                Телефон:
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </label>
              <button className="accept-changes-btn" type="submit">
                Сохранить
              </button>
              <button
                className="logout-btn"
                type="button"
                onClick={handleLogout}>
                Выйти
              </button>
            </form>
          ) : (
            <p>Загрузка...</p>
          )}
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
