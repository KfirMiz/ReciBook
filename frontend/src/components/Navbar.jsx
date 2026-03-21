import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/');
  };

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="nav-right">
          <Link to="/" className="pill">בית</Link>
          <Link to="/books" className="pill">ספרים</Link>
        </div>
        <div className="nav-left">
          {user ? (
            <>
              <Link to="/profile" className="pill">{user.nickname}</Link>
              <button onClick={onLogout} className="btn btn-secondary">התנתקות</button>
            </>
          ) : (
            <Link to="/login" className="pill">התחברות</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
