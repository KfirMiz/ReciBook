import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [shareForm, setShareForm] = useState({ nickname: '', role: 'viewer' });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState(null);
  // NEW: Create a reference to anchor our screen
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, recipesRes] = await Promise.all([
        API.get(`/books/${bookId}`),
        API.get(`/books/${bookId}/recipes`, { params: { q: searchQuery } }),
      ]);
      setBook(bookRes.data);
      setRecipes(recipesRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בטעינת הספר');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [bookId, searchQuery, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
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

  // UPDATED: No more prompt, just confirm and execute
  const handleRoleChange = async (user, newRole) => {
    setOpenDropdownId(null); // Close the dropdown immediately

    const confirmMsg = newRole === 'remove' 
      ? `האם אתה בטוח שברצונך להסיר את הגישה של ${user.nickname} לחלוטין?`
      : `האם אתה בטוח שברצונך לשנות את ההרשאה של ${user.nickname}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await API.post(`/books/${bookId}/share`, { nickname: user.nickname, role: newRole });
      alert('ההרשאות עודכנו בהצלחה');
      load(); 
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בעדכון הרשאות');
    }
  };

  // UPDATED: Includes the dropdown menu UI
  const renderUserPill = (user, roleLabel, roleType) => {
    if (!user || typeof user === 'string') return null; 
    
    const isOwnerLogged = book?.accessLevel === 'owner';
    const isClickable = isOwnerLogged && roleType !== 'owner';
    const isOpen = openDropdownId === user._id;
    
    return (
      <div key={user._id} style={{ position: 'relative', display: 'inline-block', marginRight: '8px', marginBottom: '8px' }}>
        
        {/* The Clickable Pill */}
        <div 
          onClick={() => isClickable ? setOpenDropdownId(isOpen ? null : user._id) : undefined}
          title={isClickable ? 'לחץ לניהול הרשאות' : ''}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: isOpen ? '#e0e0e0' : '#f0f0f0', // Darkens slightly when open
            padding: '4px 10px', 
            borderRadius: '16px', 
            fontSize: '0.85em', 
            cursor: isClickable ? 'pointer' : 'default',
            border: isClickable ? '1px solid #ccc' : '1px solid transparent',
          }}
        >
          {user.pictureURL && (
            <img src={user.pictureURL} alt={user.nickname} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <span>{user.nickname} <span style={{ color: '#888', fontSize: '0.9em' }}>({roleLabel})</span></span>
        </div>

        {/* The Dropdown Menu */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10,
            minWidth: '130px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {roleType !== 'editor' && (
              <button 
                onClick={() => handleRoleChange(user, 'editor')}
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #eee', padding: '10px', textAlign: 'right', cursor: 'pointer', width: '100%' }}
              >
                שנה לעורך
              </button>
            )}
            {roleType !== 'viewer' && (
              <button 
                onClick={() => handleRoleChange(user, 'viewer')}
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #eee', padding: '10px', textAlign: 'right', cursor: 'pointer', width: '100%' }}
              >
                שנה לצופה
              </button>
            )}
            <button 
              onClick={() => handleRoleChange(user, 'remove')}
              style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'right', cursor: 'pointer', width: '100%', color: '#ff4d4f', fontWeight: 'bold' }}
            >
              הסר גישה
            </button>
          </div>
        )}
      </div>
    );
  };

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
        
        <div style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          {renderUserPill(book.ownerId, 'בעלים', 'owner')}
          {book.editors?.map(editor => renderUserPill(editor, 'עורך', 'editor'))}
          {book.viewers?.map(viewer => renderUserPill(viewer, 'צופה', 'viewer'))}
        </div>

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
        {/* UPDATED: Added ref, scrollMargin, and onFocus */}
        <div 
          className="row-wrap" 
          ref={searchRef} 
          style={{ scrollMarginTop: '80px' }} 
        >
          <input
            className="input"
            placeholder="חיפוש מתכון לפי שם"
            value={searchInput}
            //onChange={(e) => setSearchInput(e.target.value)}
            onChange={(e) => {
              setSearchInput(e.target.value);
              // Gently anchor the view on every keystroke
              searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
            onFocus={() => {
              // Smoothly scroll the view to this box the moment they tap it
              searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </div>
      </div>
      <section className="book-grid" style={{ marginTop: 14, minHeight: '33vh' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                {recipe.creatorAvatar ? (
                  <img 
                    src={recipe.creatorAvatar} 
                    alt={recipe.creatorNickname} 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : null}
                <p className="muted" style={{ margin: 0, fontSize: '0.9em' }}>יוצר: {recipe.creatorNickname || 'לא ידוע'}</p>
              </div>
            </div>
          </article>
        ))}
        {!recipes.length ? <p className="muted">אין מתכונים להצגה</p> : null}
      </section>
    </div>
  );
}