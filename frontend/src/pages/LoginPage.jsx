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

  // NEW: Consistent label style from your Profile page
  const labelStyle = { fontSize: '0.9em', fontWeight: 'bold', color: 'var(--text)', marginBottom: '4px', display: 'block' };
  const inputWrapperStyle = { marginBottom: '12px', textAlign: 'right' }; // textAlign ensures Hebrew aligns right

  return (
    <div className="container narrow">
      <div className="card">
        <h2 className="page-title">{isSignup ? 'יצירת חשבון' : 'התחברות'}</h2>
        
        <form onSubmit={submit} className="form" style={{ marginTop: '16px' }}>
          
          {/* NICKNAME - Only shows during Signup */}
          {isSignup && (
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>כינוי (יוצג לשאר המשתמשים)</label>
              <input
                className="input"
                placeholder="הזן כינוי (חייב להיות ייחודי)"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                required
              />
            </div>
          )}

          {/* USERNAME */}
          <div style={inputWrapperStyle}>
            <label style={labelStyle}>
              {isSignup ? 'שם משתמש (לצורך התחברות)' : 'שם משתמש'}
            </label>
            <input
              className="input"
              placeholder={isSignup ? "הזן שם משתמש (חייב להיות ייחודי)" : "הזן שם משתמש"}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          {/* PASSWORD */}
          <div style={inputWrapperStyle}>
            <label style={labelStyle}>סיסמה</label>
            <input
              className="input"
              placeholder={isSignup ? "בחר סיסמה (לפחות 6 תווים)" : "הזן סיסמה"}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '8px' }}>
            {isSignup ? 'הרשמה' : 'התחברות'}
          </button>
        </form>
        
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '16px', width: '50%' }}
          onClick={() => {
            setIsSignup((prev) => !prev);
            // Optional: clear the form when switching modes
            setForm({ username: '', password: '', nickname: '' });
          }}
        >
          {isSignup ? 'יש לי חשבון, התחברות' : 'אין לך חשבון? צור אחד עכשיו!'}
        </button>
      </div>
    </div>
  );
}