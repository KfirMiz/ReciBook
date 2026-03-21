import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function BookCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', pictureURL: '', visibility: 'private' });
  const [uploading, setUploading] = useState(false);

  const onUpload = async (file) => {
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

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/books', form);
      navigate(`/books/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'יצירת ספר נכשלה');
    }
  };

  return (
    <div className="container narrow">
      <div className="card">
        <h2 className="page-title">יצירת ספר חדש</h2>
        <form className="form" onSubmit={submit}>
          <input
            className="input"
            placeholder="שם הספר"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <select
            className="input"
            value={form.visibility}
            onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}
          >
            <option value="private">פרטי</option>
            <option value="public">ציבורי</option>
          </select>
          <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} />
          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? 'מעלה תמונה...' : 'יצירה'}
          </button>
        </form>
      </div>
    </div>
  );
}
