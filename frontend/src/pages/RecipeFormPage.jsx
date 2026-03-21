import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/api';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function RecipeFormPage() {
  const { bookId, recipeId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(recipeId);
  const [ingredientInput, setIngredientInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'regular',
    ingredients: [],
    instructions: '',
    link: '',
    description: '',
    pictureURL: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    const run = async () => {
      try {
        const res = await API.get(`/recipes/${recipeId}`);
        setForm({
          name: res.data.name,
          type: res.data.type,
          ingredients: res.data.ingredients || [],
          instructions: res.data.instructions || '',
          link: res.data.link || '',
          description: res.data.description || '',
          pictureURL: res.data.pictureURL || '',
        });
      } catch {
        alert('טעינת מתכון לעריכה נכשלה');
      }
    };
    run();
  }, [isEdit, recipeId]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/recipes/${recipeId}`, form);
        navigate(`/recipes/${recipeId}`);
      } else {
        const res = await API.post(`/books/${bookId}/recipes`, form);
        navigate(`/recipes/${res.data.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'שמירת מתכון נכשלה');
    }
  };

  const uploadImage = async (file) => {
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

  return (
    <div className="container narrow">
      <div className="card">
        <h2 className="page-title">{isEdit ? 'עריכת מתכון' : 'יצירת מתכון'}</h2>
        <form className="form" onSubmit={submit}>
          <input
            className="input"
            placeholder="שם המתכון"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="regular">מתכון רגיל</option>
            <option value="link">מתכון קישור</option>
          </select>
          {form.type === 'regular' ? (
            <>
              <div className="row-wrap">
                <input
                  className="input"
                  placeholder="הוספת מרכיב"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!ingredientInput.trim()) return;
                    setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, ingredientInput.trim()] }));
                    setIngredientInput('');
                  }}
                >
                  הוסף מרכיב
                </button>
              </div>
              <ul>
                {form.ingredients.map((ing, idx) => <li key={`${ing}-${idx}`}>{ing}</li>)}
              </ul>
              <textarea
                className="textarea"
                placeholder="הוראות הכנה"
                value={form.instructions}
                onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
                required
              />
            </>
          ) : (
            <>
              <input
                className="input"
                placeholder="קישור"
                value={form.link}
                onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                required
              />
              <textarea
                className="textarea"
                placeholder="תיאור (לא חובה)"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </>
          )}
          <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? 'מעלה תמונה...' : isEdit ? 'שמירת שינויים' : 'יצירת מתכון'}
          </button>
        </form>
      </div>
    </div>
  );
}
