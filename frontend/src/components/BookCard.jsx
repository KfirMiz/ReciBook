import React from 'react';
import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-image-link">
        {book.pictureURL ? (
          <img src={book.pictureURL} alt={book.name} className="book-thumb" />
        ) : (
          <div className="book-thumb placeholder">{book.name[0]}</div>
        )}
      </Link>
      <div className="book-body">
        <Link to={`/books/${book.id}`} className="book-name">{book.name}</Link>
        <p className="muted">{book.visibility === 'public' ? 'ציבורי' : 'פרטי'}</p>
      </div>
    </article>
  );
}
