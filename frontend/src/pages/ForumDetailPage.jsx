import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [shareForm, setShareForm] = useState({ nickname: '', role: 'viewer' });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const searchRef = useRef(null);

  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', pictureURL: '', visibility: 'private' });
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleRoleChange = async (user, newRole) => {
    setOpenDropdownId(null); 

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

  const startEditingBook = () => {
    setEditForm({ 
      name: book.name, 
      pictureURL: book.pictureURL || '',
      visibility: book.visibility || 'private'
    });
    setIsEditingBook(true);
  };

  const handleBookImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm((prev) => ({ ...prev, pictureURL: url }));
    } catch {
      alert('העלאת התמונה נכשלה');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveBookDetails = async () => {
    if (!editForm.name.trim()) {
      return alert('שם הספר לא יכול להיות ריק');
    }
    try {
      await API.put(`/books/${bookId}`, { 
        name: editForm.name.trim(), 
        pictureURL: editForm.pictureURL,
        visibility: editForm.visibility
      });
      setBook((prev) => ({ 
        ...prev, 
        name: editForm.name.trim(), 
        pictureURL: editForm.pictureURL,
        visibility: editForm.visibility
      }));
      setIsEditingBook(false);
      alert('פרטי הספר עודכנו בהצלחה');
    } catch (err) {
      alert(err.response?.data?.message || 'שגיאה בעדכון הספר');
    }
  };

  const renderUserPill = (user, roleLabel, roleType) => {
    if (!user || typeof user === 'string') return null; 
    
    const isOwnerLogged = book?.accessLevel === 'owner';
    const isClickable = isOwnerLogged && roleType !== 'owner';
    const isOpen = openDropdownId === user._id;
    
    return (
      <div key={user._id} style={{ position: 'relative', display: 'inline-block', marginRight: '8px', marginBottom: '8px' }}>
        <div 
          onClick={() => isClickable ? setOpenDropdownId(isOpen ? null : user._id) : undefined}
          title={isClickable ? 'לחץ לניהול הרשאות' : ''}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: isOpen ? '#e0e0e0' : '#f0f0f0',
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
  
  // Consistent label style from Profile page
  const labelStyle = { fontSize: '0.9em', fontWeight: 'bold', color: 'var(--text)', marginBottom: '6px', display: 'block' };

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate('/books')}>חזרה לספרים</button>
      <div className="card" style={{ marginTop: 12 }}>
        
        {isEditingBook ? (
          <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '16px', backgroundColor: '#fffdf9' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-strong)' }}>עריכת פרטי הספר</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>שם הספר</label>
                <input 
                  className="input" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                  placeholder="הזן שם לספר"
                />
              </div>
              <div>
                <label style={labelStyle}>תמונת הספר</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {editForm.pictureURL && (
                    <img src={editForm.pictureURL} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                  <input type="file" accept="image/*" onChange={handleBookImageUpload} disabled={uploadingImage} />
                  {uploadingImage && <span className="muted">מעלה...</span>}
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>הרשאות צפייה</label>
                <select 
                  className="input" 
                  value={editForm.visibility} 
                  onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                >
                  <option value="private">פרטי (רק למוזמנים)</option>
                  <option value="public">ציבורי (פתוח לכולם)</option>
                </select>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                 <label style={labelStyle}>שיתוף הספר עם משתמש חדש</label>
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
                    <button className="btn" type="submit">שיתוף</button>
                </form>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn" onClick={saveBookDetails} disabled={uploadingImage}>שמור שינויים</button>
                <button className="btn btn-secondary" onClick={() => setIsEditingBook(false)}>סגור עריכה</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <h2 className="page-title" style={{ margin: 0 }}>
                {book.name}
                <span style={{ fontSize: '0.5em', verticalAlign: 'middle', marginLeft: '8px', padding: '4px 8px', borderRadius: '12px', background: '#eee', color: '#666', fontWeight: 'normal' }}>
                  {book.visibility === 'public' ? 'ציבורי' : 'פרטי'}
                </span>
              </h2>
              {isOwner && (
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85em' }} onClick={startEditingBook}>
                  ערוך ספר
                </button>
              )}
            </div>
            <div style={{ height: '12px' }} />
            {book.pictureURL ? <img src={book.pictureURL} alt={book.name} className="hero-image" /> : null}
          </>
        )}

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
        </div>

        {/* NEW: Title added for the search section */}
        {/* UPDATED: Centered the label and input container */}
        <div 
          ref={searchRef} 
          style={{ 
            scrollMarginTop: '80px', 
            marginTop: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' // Centers the children horizontally
          }} 
        >
          <label style={{ 
            ...labelStyle, 
            textAlign: 'center', 
            width: '100%', 
            marginBottom: '8px' 
          }}>
            חיפוש מתכונים
          </label>
          
          <div className="row-wrap" style={{ marginTop: 0, width: '100%', justifyContent: 'center' }}>
            <input
              className="input"
              placeholder="חפש לפי שם המנה..."
              value={searchInput}
              style={{ maxWidth: '500px' }} // Optional: keeps the search box from getting too wide on PC
              onChange={(e) => {
                setSearchInput(e.target.value);
                searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
              onFocus={() => {
                searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </div>
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