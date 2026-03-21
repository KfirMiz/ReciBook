import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', nickname: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const path = isSignup ? '/users/register' : '/users/login';
      const payload = isSignup
        ? { username: form.username, password: form.password, nickname: form.nickname }
        : { username: form.username, password: form.password };
      const res = await API.post(path, payload);
      login(res.data.user, res.data.token);
      navigate('/books');
    } catch (err) {
      alert(err.response?.data?.message || 'פרטים שגויים או משתמש קיים');
    }
  };

  return (
    <div className="container narrow">
      <div className="card">
        <h2 className="page-title">{isSignup ? 'יצירת חשבון' : 'התחברות'}</h2>
        <form onSubmit={submit} className="form">
          {isSignup && (
            <input
              className="input"
              placeholder="כינוי"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              required
            />
          )}
          <input
            className="input"
            placeholder="שם משתמש"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="סיסמה"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="btn">{isSignup ? 'הרשמה' : 'התחברות'}</button>
        </form>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsSignup((prev) => !prev)}
        >
          {isSignup ? 'יש לי חשבון, התחברות' : 'אין לך חשבון? צור אחד עכשיו!'}
        </button>
      </div>
    </div>
  );
}
