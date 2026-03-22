/*
export const hasBookViewAccess = (book, userId) => {
  if (book.visibility === 'public') return true;
  if (!userId) return false;
  const uid = String(userId);
  if (String(book.ownerId) === uid) return true;
  if (book.editors.some((id) => String(id) === uid)) return true;
  if (book.viewers.some((id) => String(id) === uid)) return true;
  return false;
};

export const hasBookEditAccess = (book, userId) => {
  if (!userId) return false;
  const uid = String(userId);
  if (String(book.ownerId) === uid) return true;
  return book.editors.some((id) => String(id) === uid);
};

export const getAccessLevel = (book, userId) => {
  if (!userId) return book.visibility === 'public' ? 'guest' : 'none';
  const uid = String(userId);
  if (String(book.ownerId) === uid) return 'owner';
  if (book.editors.some((id) => String(id) === uid)) return 'editor';
  if (book.viewers.some((id) => String(id) === uid)) return 'viewer';
  return book.visibility === 'public' ? 'guest' : 'none';
};
*/
// Helper function to extract the ID cleanly, whether it's a Mongoose object or a raw string
const extractId = (docOrId) => {
  if (!docOrId) return null;
  return String(docOrId._id || docOrId);
};

export const hasBookViewAccess = (book, userId) => {
  if (book.visibility === 'public') return true;
  if (!userId) return false;
  const uid = String(userId);
  
  if (extractId(book.ownerId) === uid) return true;
  if (book.editors.some((id) => extractId(id) === uid)) return true;
  if (book.viewers.some((id) => extractId(id) === uid)) return true;
  return false;
};

export const hasBookEditAccess = (book, userId) => {
  if (!userId) return false;
  const uid = String(userId);
  
  if (extractId(book.ownerId) === uid) return true;
  return book.editors.some((id) => extractId(id) === uid);
};

export const getAccessLevel = (book, userId) => {
  if (!userId) return book.visibility === 'public' ? 'guest' : 'none';
  const uid = String(userId);
  
  if (extractId(book.ownerId) === uid) return 'owner';
  if (book.editors.some((id) => extractId(id) === uid)) return 'editor';
  if (book.viewers.some((id) => extractId(id) === uid)) return 'viewer';
  return book.visibility === 'public' ? 'guest' : 'none';
};