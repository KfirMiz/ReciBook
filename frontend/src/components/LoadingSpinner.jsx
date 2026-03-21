import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" />
    </div>
  );
}
