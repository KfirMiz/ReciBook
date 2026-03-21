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
            <h2 className="page-title" style={{ margin: 0 }}>פרופיל</h2>
            <p className="muted" style={{ margin: 0 }}>כאן אפשר לעדכן כינוי, סיסמה ותמונת פרופיל.</p>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <form onSubmit={submit} className="form">
          <div className="grid-2">
            <input
              className="input"
              placeholder="שם משתמש"
              value={form.username}
              readOnly
            />
            <input
              className="input"
              placeholder="כינוי"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <input
              className="input"
              placeholder="סיסמה נוכחית"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
            <input
              className="input"
              placeholder="סיסמה חדשה (לא חובה)"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {uploading ? (
              <p className="muted" style={{ margin: 0 }}>מעלה...</p>
            ) : form.pictureURL ? (
              <img src={form.pictureURL} alt="preview" className="avatar" style={{ width: 86, height: 86 }} />
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                גרור/בחר תמונת פרופיל חדשה
              </p>
            )}
            <input type="file" accept="image/*" onChange={handleBrowse} />
          </div>

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
        </form>
      </div>
    </div>
  );
}
