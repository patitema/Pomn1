import Nav from "../../components/nav/nav";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer/footer";
import { useUsers } from "../../hooks/UseUsers";
import { useValidation } from "../../hooks/useValidation";
import PhoneInput from "../../components/PhoneInput/PhoneInput";
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
  const [serverErrors, setServerErrors] = useState({});
  const { register } = useUsers();
  const { errors, validateAll, clearError, clearErrors } = useValidation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Очищаем предыдущие ошибки
    clearErrors();
    setServerErrors({});

    // Проверяем совпадение паролей
    if (userData.password !== userData.confirmPassword) {
      setServerErrors({ confirmPassword: ['Пароли не совпадают'] });
      return;
    }

    // Валидация всех полей
    const isValid = validateAll(userData);
    if (!isValid) {
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
      // Обработка ошибок от сервера (уникальность и т.д.)
      if (err.message.includes('уже занят') || err.message.includes('already exists')) {
        setServerErrors({ username: ['Этот логин уже занят'] });
      } else if (err.message.includes('email') || err.message.includes('Email')) {
        setServerErrors({ email: ['Этот email уже зарегистрирован'] });
      } else {
        setServerErrors({ general: [err.message] });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    // Очищаем ошибку поля при изменении
    clearError(name);
    if (name === 'confirmPassword') {
      setServerErrors(prev => ({ ...prev, confirmPassword: null }));
    }
  };

  return (
    <div>
      <Nav></Nav>
      <main>
        <div className="main-container">
          <h1>Регистрация</h1>
          <form className="reg-form" onSubmit={handleSubmit}>
            {/* Общая ошибка */}
            {serverErrors.general && (
              <div className="form-error-general">
                {serverErrors.general.join(', ')}
              </div>
            )}

            {/* Логин */}
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Логин"
                value={userData.username}
                onChange={handleChange}
                className={errors.username || serverErrors.username ? 'error' : ''}
              />
              {(errors.username || serverErrors.username) && (
                <span className="form-error">
                  {errors.username || serverErrors.username}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
                className={errors.email || serverErrors.email ? 'error' : ''}
              />
              {(errors.email || serverErrors.email) && (
                <span className="form-error">
                  {errors.email || serverErrors.email}
                </span>
              )}
            </div>

            {/* Телефон */}
            <div className="form-group">
              <PhoneInput
                name="phone_number"
                value={userData.phone_number}
                onChange={handleChange}
                error={errors.phone_number}
              />
            </div>

            {/* Пароль */}
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={userData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            {/* Повтор пароля */}
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={userData.confirmPassword}
                onChange={handleChange}
                className={serverErrors.confirmPassword ? 'error' : ''}
              />
              {serverErrors.confirmPassword && (
                <span className="form-error">{serverErrors.confirmPassword}</span>
              )}
            </div>

            <input
              className="log-btn"
              type="submit"
              value="Зарегистрироваться"
            />
            <Link to="/Auth">
              <button className="switch-btn" type="button">Войти</button>
            </Link>
          </form>
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
