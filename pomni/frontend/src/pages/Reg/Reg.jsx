import Nav from "../../components/nav/nav";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer/footer";
import { useUsers } from "../../hooks/UseUsers";
import "./Reg.css";

export default function Registration() {
  document.title = "Регистрация";
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const { register } = useUsers();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    try {
      await register({
        username: userData.username,
        email: userData.email,
        phone_number: userData.phone_number,
        password: userData.password,
      });
      navigate("/");
    } catch (err) {
      alert("Ошибка регистрации: " + err.message);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Nav></Nav>
      <main>
        <div className="main-container">
          <h1>Регистрация</h1>
          <form className="reg-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="login"
              value={userData.username}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="email"
              value={userData.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone_number"
              placeholder="phone"
              value={userData.phone_number}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="password"
              value={userData.password}
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="repeat password"
              value={userData.confirmPassword}
              onChange={handleChange}
            />
            <input
              className="log-btn"
              type="submit"
              value="Зарегестрироваться"
            />
            <Link to="/Auth">
              <button className="switch-btn">Войти</button>
            </Link>
          </form>
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
