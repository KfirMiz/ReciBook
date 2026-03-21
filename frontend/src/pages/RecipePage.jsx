import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RecipePage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  //
  const location = useLocation(); // Catch the data passed from the router
  // Safely extract the accessLevel. If it's missing, default to 'viewer' for safety.
  const accessLevel = location.state?.accessLevel || 'viewer'; 
  const canEdit = ['owner', 'editor'].includes(accessLevel);
  //
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/recipes/${recipeId}`);
        setRecipe(res.data);
      } catch (err) {
        alert(err.response?.data?.message || 'שגיאה בטעינת מתכון');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [recipeId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!recipe) return null;

  return (
    <div className="container narrow">
      <div className="card">
        <button className="btn btn-secondary" onClick={() => navigate(`/books/${recipe.bookId}`)}>חזרה לספר</button>
        <h1 className="page-title">{recipe.name}</h1>
        {recipe.pictureURL ? <img src={recipe.pictureURL} alt={recipe.name} className="hero-image" /> : null}
        <p className="muted">נוצר על ידי: {recipe.creatorNickname || 'לא ידוע'}</p>
        {recipe.type === 'regular' ? (
          <>
            <h3>מרכיבים</h3>
            <ul>
              {recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
            </ul>
            <h3>הוראות הכנה</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
          </>
        ) : (
          <>
            <h3>קישור</h3>
            <a href={recipe.link} target="_blank" rel="noreferrer">{recipe.link}</a>
            <h3>תיאור</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.description || 'אין תיאור'}</p>
          </>
        )}
        {canEdit ? (
          <button className="btn" onClick={() => navigate(`/recipes/${recipe.id}/edit`)}>
            עדכון מתכון
          </button>
        ) : null}
      </div>
    </div>
  );
}
