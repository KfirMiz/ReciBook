import React, { useEffect, useState, useContext } from 'react';
import API from '../api/api';
import BookCard from '../components/BookCard';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BooksPage() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for the toggle. Defaults to 'my' if logged in, 'public' if guest.
  const [viewMode, setViewMode] = useState(user ? 'my' : 'public');

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

  // NEW: Filter the books based on the active tab and user status
  const displayedBooks = books.filter(book => {
    // 1. Guests can only ever see public books
    if (!user) return book.visibility === 'public'; 
    
    // 2. Logged-in users toggling the tabs
    if (viewMode === 'public') {
      return book.visibility === 'public';
    } else {
      // 'My Books' tab: Show books they own or have explicit access to.
      // If your backend attaches an accessLevel, we use it:
      if (book.accessLevel) {
        return ['owner', 'editor', 'viewer'].includes(book.accessLevel);
      }
      // Fallback: If it's private and the backend sent it to us, it means it's shared with us.
      // Or if we are the explicit owner.
      const userId = user.id || user._id;
      return book.ownerId === userId || book.visibility === 'private';
    }
  });

  return (
    <div className="container">
      {/* UPDATED: Dynamic title based on the view */}
      <h2 className="page-title">
        {!user ? 'ספרים ציבוריים' : viewMode === 'my' ? 'הספרים שלי' : 'ספרים ציבוריים'}
      </h2>

      {user ? (
        <>
          {/* NEW: The Toggle Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button 
              className={`btn ${viewMode === 'my' ? '' : 'btn-secondary'}`} 
              onClick={() => setViewMode('my')}
              style={{ flex: 1 }} // Makes both buttons equal width
            >
              הספרים שלי
            </button>
            <button 
              className={`btn ${viewMode === 'public' ? '' : 'btn-secondary'}`} 
              onClick={() => setViewMode('public')}
              style={{ flex: 1 }}
            >
              ספרים ציבוריים
            </button>
          </div>

          {/* UPDATED: Only show the "Create Book" banner in the "My Books" tab */}
          {viewMode === 'my' && (
            <section className="card row-between" style={{ marginBottom: '16px' }}>
              <p className="muted" style={{ margin: 0 }}>אפשר ליצור ספר חדש או לצפות בספרים קיימים.</p>
              <Link to="/books/new" className="btn">יצירת ספר חדש</Link>
            </section>
          )}
        </>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="muted" style={{ margin: 0 }}>תוכל לראות ספרים ציבוריים. להתחברות יש יותר אפשרויות.</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <section className="book-grid">
          {displayedBooks.map((book) => <BookCard key={book.id || book._id} book={book} />)}
          
          {/* NEW: Friendly message if a tab is empty */}
          {!displayedBooks.length && (
            <p className="muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px 0' }}>
              אין ספרים להצגה בקטגוריה זו.
            </p>
          )}
        </section>
      )}
    </div>
  );
}