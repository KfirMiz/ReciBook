import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [shareForm, setShareForm] = useState({ nickname: '', role: 'viewer' });
  //const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Controls what you see in the box
  const [searchQuery, setSearchQuery] = useState(''); // Controls what goes to the API
  //
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, recipesRes] = await Promise.all([
        API.get(`/books/${bookId}`),
        API.get(`/books/${bookId}/recipes`, { params: { q: searchQuery } }), // Changed to searchQuery
      ]);
      setBook(bookRes.data);
      setRecipes(recipesRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בטעינת הספר');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [bookId, searchQuery, navigate]); // Changed dependency to searchQuery

  useEffect(() => { load(); }, [load]);
  // NEW
  useEffect(() => {
    // Set a timer to update the actual search query 300ms after you stop typing
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    // This cleanup function clears the timer if you type another letter before the 300ms is up
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const shareBook = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/books/${bookId}/share`, shareForm);
      setShareForm({ nickname: '', role: 'viewer' });
      alert('הספר שותף בהצלחה');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'שיתוף נכשל');
    }
  };

  //if (loading) return <LoadingSpinner />;
  if (loading && !book) return <LoadingSpinner />;
  if (!book) return null;

  const isOwner = book.accessLevel === 'owner';
  const canEdit = ['owner', 'editor'].includes(book.accessLevel);

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate('/books')}>חזרה לספרים</button>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 className="page-title">{book.name}</h2>
        {book.pictureURL ? <img src={book.pictureURL} alt={book.name} className="hero-image" /> : null}
        <p className="muted">הרשאה: {book.accessLevel}</p>
        <div className="row-wrap">
          {canEdit ? (
            <button className="btn" onClick={() => navigate(`/books/${bookId}/recipes/new`)}>הוספת מתכון</button>
          ) : null}
          {isOwner ? (
            <form onSubmit={shareBook} className="inline-form">
              <input
                className="input"
                placeholder="כינוי לשיתוף"
                value={shareForm.nickname}
                onChange={(e) => setShareForm((prev) => ({ ...prev, nickname: e.target.value }))}
                required
              />
              <select
                className="input"
                value={shareForm.role}
                onChange={(e) => setShareForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="viewer">צופה</option>
                <option value="editor">עורך</option>
              </select>
              <button className="btn" type="submit">שיתוף ספר</button>
            </form>
          ) : null}
        </div>
        <div className="row-wrap">
          <input
            className="input"
            placeholder="חיפוש מתכון לפי שם"
            value={searchInput} // Changed to searchInput
            onChange={(e) => setSearchInput(e.target.value)} // Changed to setSearchInput
            onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)} // Bonus: allows searching by hitting Enter!
          />
          {/*<button className="btn btn-secondary" onClick={() => setSearchQuery(searchInput)}>חיפוש</button> */} 
        </div>
      </div>
      <section className="book-grid" style={{ marginTop: 14 }}>
        {recipes.map((recipe) => (
          <article className="book-card" key={recipe.id}>
            <button className="unstyled-link" onClick={() => navigate(`/recipes/${recipe.id}`, { state: { accessLevel: book.accessLevel } })}>
              {recipe.pictureURL
                ? <img src={recipe.pictureURL} alt={recipe.name} className="book-thumb" />
                : <div className="book-thumb placeholder">{recipe.name[0]}</div>}
            </button>
            <div className="book-body">
              <button className="unstyled-link book-name" onClick={() => navigate(`/recipes/${recipe.id}`, { state: { accessLevel: book.accessLevel } })}>
                {recipe.name}
              </button>
              <p className="muted">יוצר: {recipe.creatorNickname || 'לא ידוע'}</p>
            </div>
          </article>
        ))}
        {!recipes.length ? <p className="muted">אין מתכונים להצגה</p> : null}
      </section>
    </div>
  );
}
