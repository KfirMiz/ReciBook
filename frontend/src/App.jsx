import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/ForumsPage';
import BookPage from './pages/ForumDetailPage';
import ProfilePage from './pages/ProfilePage';
import BookCreatePage from './pages/BookCreatePage';
import RecipePage from './pages/RecipePage';
import RecipeFormPage from './pages/RecipeFormPage';

export default function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/new" element={<BookCreatePage />} />
          <Route path="/books/:bookId" element={<BookPage />} />
          <Route path="/books/:bookId/recipes/new" element={<RecipeFormPage />} />
          <Route path="/recipes/:recipeId" element={<RecipePage />} />
          <Route path="/recipes/:recipeId/edit" element={<RecipeFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </Router>
  );
}
