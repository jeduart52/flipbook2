import { Book } from '../types';
import { BookOpen } from 'lucide-react';

interface BookLibraryProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export default function BookLibrary({ books, onSelectBook }: BookLibraryProps) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-blue-500" />
          <h1 className="text-4xl font-bold text-white">FlipBook Library</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="aspect-[3/4] bg-gray-700 relative overflow-hidden">
                <img
                  src={`/${book.thumbnail}`}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23374151" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239CA3AF" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="text-white font-semibold">Open Book</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {book.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
