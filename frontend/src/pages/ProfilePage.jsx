import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUserLocal, logout } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: user?.username || '',
    nickname: user?.nickname || '',
    password: '',
    currentPassword: '',
    pictureURL: user?.pictureURL || '',
  });
  const [uploading, setUploading] = useState(false);

  if (!user) return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card">
        <h2 className="page-title" style={{ marginTop: 0 }}>Profile</h2>
        <p className="muted" style={{ marginBottom: 0 }}>Please log in to view your profile.</p>
      </div>
    </div>
  );

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, pictureURL: url }));
    } catch {
      alert('העלאת תמונה נכשלה');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nickname: form.nickname,
        pictureURL: form.pictureURL,
      };
      if (form.password) {
        payload.password = form.password;
        payload.currentPassword = form.currentPassword;
      }
      const res = await API.put(`/users/${user.id || user._id}`, payload);
      updateUserLocal(res.data);
      alert('הפרופיל עודכן');
      setForm((prev) => ({ ...prev, password: '', currentPassword: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'עדכון נכשל');
    }
  };

  const inputWrapperStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
  const labelStyle = { fontSize: '0.9em', fontWeight: 'bold', color: 'var(--text)' };
  
  // NEW: A style for our sub-headings to keep things organized
  const sectionTitleStyle = { 
    marginTop: '24px', 
    marginBottom: '12px', 
    fontSize: '1.1em', 
    borderBottom: '1px solid var(--border)', 
    paddingBottom: '8px', 
    color: 'var(--primary-strong)' 
  };

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {user.pictureURL ? (
            <img src={user.pictureURL} alt={user.username} className="avatar" style={{ width: 56, height: 56 }} />
          ) : (
            <div className="avatar" aria-hidden="true" style={{ display: 'grid', placeItems: 'center' }}>
              <span style={{ fontWeight: 800 }}>{String(user.username || 'U').slice(0, 1).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h2 className="page-title" style={{ margin: 0 }}>פרופיל אישי</h2>
            <p className="muted" style={{ margin: 0 }}>ניהול החשבון וההגדרות שלך.</p>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <form onSubmit={submit} className="form">
          
          <h3 style={sectionTitleStyle}>פרטים כלליים</h3>
          
          <div className="grid-2" style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>שם משתמש (לא ניתן לשינוי)</label>
              <input
                className="input"
                placeholder="שם משתמש"
                value={form.username}
                readOnly
                style={{ backgroundColor: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
              />
            </div>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>כינוי (יוצג לשאר המשתמשים)</label>
              <input
                className="input"
                placeholder="כינוי"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />
            </div>
          </div>

          <div style={{ ...inputWrapperStyle, marginTop: '8px' }}>
            <label style={labelStyle}>תמונת פרופיל</label>
            <div
              className="dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{ border: '2px dashed var(--border)', padding: '20px', textAlign: 'center', borderRadius: '10px' }}
            >
              {uploading ? (
                <p className="muted" style={{ margin: 0 }}>מעלה...</p>
              ) : form.pictureURL ? (
                <img src={form.pictureURL} alt="preview" className="avatar" style={{ width: 86, height: 86, margin: '0 auto' }} />
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  גרור או לחץ כאן לבחירת תמונת פרופיל חדשה
                </p>
              )}
              <input type="file" accept="image/*" onChange={handleBrowse} style={{ marginTop: '10px' }} />
            </div>
          </div>

          {/* NEW: Password Section with a clear title */}
          <h3 style={sectionTitleStyle}>שינוי סיסמה (אופציונלי)</h3>
          
          <div className="grid-2" style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>סיסמה נוכחית</label>
              <input
                className="input"
                placeholder="הזן סיסמה נוכחית (לצורך אימות)"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </div>
            <div style={inputWrapperStyle}>
              <label style={labelStyle}>סיסמה חדשה</label>
              <input
                className="input"
                placeholder="הזן סיסמה חדשה"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn" type="submit" disabled={uploading}>
              {uploading ? 'מעלה...' : 'שמירת שינויים'}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              התנתקות
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}