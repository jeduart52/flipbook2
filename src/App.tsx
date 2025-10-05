import { useState, useEffect } from 'react';
import BookLibrary from './components/BookLibrary';
import FlipbookViewer from './components/FlipbookViewer';
import { Book } from './types';
import { resolveBaseUrl } from './utils/assetUrl';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    fetch(new URL('books.json', resolveBaseUrl()))
      .then(res => res.json())
      .then(data => setBooks(data.books))
      .catch(err => console.error('Error loading books:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {!selectedBook ? (
        <BookLibrary books={books} onSelectBook={setSelectedBook} />
      ) : (
        <FlipbookViewer book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}

export default App;
