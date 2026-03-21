import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container narrow">
      <div className="card centered">
        <h1 className="page-title">ReciBook</h1>
        <p className="muted">
          ברוכים הבאים ל-ReciBook - אתר ליצירה ושיתוף של ספרי מתכונים
        </p>
        <Link to="/books" className="btn btn-lg">עיון בספרים</Link>
      </div>
    </div>
  );
}
