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

  const deleteRecipe = async () => {
    // 1. Pop up the confirmation message
    const isConfirmed = window.confirm('האם אתה בטוח שברצונך למחוק מתכון זה? פעולה זו בלתי הפיכה.');
    
    // 2. If they click "Cancel", stop the function right here
    if (!isConfirmed) return;

    // 3. If they click "OK", proceed with the deletion
    try {
      await API.delete(`/recipes/${recipeId}`);
      alert('המתכון נמחק בהצלחה');
      
      // Navigate back to the specific book if we have the ID, otherwise back to the main books page
      navigate(bookId ? `/books/${bookId}` : '/books'); 
    } catch (err) {
      alert(err.response?.data?.message || 'מחיקת מתכון נכשלה');
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
                  onKeyDown={(e) => {
                    // 1. Check if the key pressed was Enter
                    if (e.key === 'Enter') {
                      // 2. Stop the form from submitting!
                      e.preventDefault(); 
                      
                      // 3. Run the exact same logic as the button click
                      if (!ingredientInput.trim()) return;
                      setForm((prev) => ({ 
                        ...prev, 
                        ingredients: [...prev.ingredients, ingredientInput.trim()] 
                      }));
                      setIngredientInput('');
                    }
                  }}
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
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {form.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        // Filter out the ingredient at this specific index
                        setForm((prev) => ({
                          ...prev,
                          ingredients: prev.ingredients.filter((_, i) => i !== idx),
                        }));
                      }}
                      style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: 0,
                        flexShrink: 0, // Prevents the button from squishing
                      }}
                      title="הסר מרכיב"
                    >
                      ✕
                    </button>
                    
                    {/* The editable input replaces the plain span */}
                    <input
                      type="text"
                      className="input"
                      value={ing}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setForm((prev) => {
                          // 1. Make a copy of the current ingredients array
                          const updatedIngredients = [...prev.ingredients];
                          // 2. Update the text at this specific index
                          updatedIngredients[idx] = newValue;
                          // 3. Return the new state
                          return { ...prev, ingredients: updatedIngredients };
                        });
                      }}
                      style={{ margin: 0, padding: '6px 10px', flex: 1 }} // flex: 1 makes it fill the available space
                    />
                  </li>
                ))}
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
          
          <div className="row-wrap" style={{ marginTop: '20px', justifyContent: 'space-between' }}>
            <button className="btn" type="submit" disabled={uploading}>
              {uploading ? 'מעלה תמונה...' : isEdit ? 'שמירת שינויים' : 'יצירת מתכון'}
            </button>

            {/* Only show the delete button if we are editing an existing recipe */}
            {isEdit ? (
              <button 
                type="button" 
                className="btn" 
                style={{ backgroundColor: '#ff4d4f', color: 'white', borderColor: '#ff4d4f' }}
                onClick={deleteRecipe}
              >
                מחיקת מתכון
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
