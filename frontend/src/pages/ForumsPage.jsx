import React, { useEffect, useState, useContext } from 'react';
import API from '../api/api';
import BookCard from '../components/BookCard';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get('/books');
      setBooks(res.data);
    } catch {
      alert('שגיאה בטעינת הספרים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h2 className="page-title">הספרים שלי</h2>

      {user ? (
        <section className="card row-between">
          <p className="muted">אפשר ליצור ספר חדש או לצפות בספרים קיימים.</p>
          <Link to="/books/new" className="btn">יצירת ספר חדש</Link>
        </section>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="muted" style={{ margin: 0 }}>תוכל לראות ספרים ציבוריים. להתחברות יש יותר אפשרויות.</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <section className="book-grid">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </section>
      )}
    </div>
  );
}
