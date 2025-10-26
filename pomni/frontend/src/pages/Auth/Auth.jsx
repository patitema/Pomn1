import Nav from "../../components/nav/nav";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer/footer";
import { useUsers } from "../../hooks/UseUsers";
import "./Auth.css";

export default function Authorization() {
  document.title = "ВХОД";
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const { login } = useUsers();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate("/");
    } catch (err) {
      alert("Ошибка входа: " + err.message);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Nav></Nav>
      <main>
        <div className="main-container">
          <h1>ВХОД</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="login"
              value={credentials.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="password"
              value={credentials.password}
              onChange={handleChange}
            />
            <input className="log-btn" type="submit" value="Войти" />
            <Link to="/Reg">
              <button className="switch-btn">Зарегестрироваться</button>
            </Link>
          </form>
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
