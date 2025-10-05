import { useState, useEffect, useRef } from 'react';
import { Book, BookData } from '../types';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Search, Download, Printer, Home, Grid3x3, SkipBack, SkipForward } from 'lucide-react';
import HotspotOverlay from './HotspotOverlay';
import { resolveAssetUrl } from '../utils/assetUrl';

interface FlipbookViewerProps {
  book: Book;
  onClose: () => void;
}

export default function FlipbookViewer({ book, onClose }: FlipbookViewerProps) {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    fetch(new URL(`${book.folder}/pages.json`, import.meta.env.BASE_URL))
      .then(res => res.json())
      .then(data => {
        setBookData(data);
        if (data.pages.length > 0) {
          const img = new Image();
          img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
          };
          img.src = resolveAssetUrl(`${book.folder}/${data.pages[0].img}`);
        }
      })
      .catch(err => console.error('Error loading book data:', err));
  }, [book]);

  const totalSpreads = bookData ? Math.ceil(bookData.pages.length / 2) : 0;

  const flipToSpread = (spreadIndex: number) => {
    if (isFlipping || !bookData) return;
    if (spreadIndex < 0 || spreadIndex >= totalSpreads) return;

    const direction = spreadIndex > currentSpread ? 'next' : 'prev';
    setFlipDirection(direction);
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentSpread(spreadIndex);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 800);
  };

  const nextSpread = () => {
    if (currentSpread < totalSpreads - 1) {
      flipToSpread(currentSpread + 1);
    }
  };

  const prevSpread = () => {
    if (currentSpread > 0) {
      flipToSpread(currentSpread - 1);
    }
  };

  const firstSpread = () => flipToSpread(0);
  const lastSpread = () => flipToSpread(totalSpreads - 1);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 2.5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));

  const handlePageInput = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && bookData) {
      const spreadIndex = Math.floor((pageNum - 1) / 2);
      flipToSpread(Math.max(0, Math.min(spreadIndex, totalSpreads - 1)));
    }
    setPageInput('');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        prevSpread();
      } else {
        nextSpread();
      }
      isDragging.current = false;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading book...</div>
      </div>
    );
  }

  const leftPageIndex = currentSpread * 2;
  const rightPageIndex = leftPageIndex + 1;
  const leftPage = bookData.pages[leftPageIndex] || null;
  const rightPage = rightPageIndex < bookData.pages.length ? bookData.pages[rightPageIndex] : null;

  const aspectRatio = imageDimensions.height / imageDimensions.width;
  const baseWidth = 450;
  const pageHeight = baseWidth * aspectRatio;

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col overflow-hidden">
      <div className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 shadow-lg">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
              title="Thumbnails"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={firstSpread}
              disabled={currentSpread === 0}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="First Page"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={prevSpread}
              disabled={currentSpread === 0}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <form onSubmit={handlePageInput} className="flex items-center gap-2">
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={`${leftPageIndex + 1}`}
                className="w-16 px-2 py-1 bg-gray-700 text-white text-center rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <span className="text-gray-400 text-sm">/ {bookData.pages.length}</span>
            </form>

            <button
              onClick={nextSpread}
              disabled={currentSpread >= totalSpreads - 1}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={lastSpread}
              disabled={currentSpread >= totalSpreads - 1}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Last Page"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-gray-300 text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {showThumbnails && (
          <div className="w-64 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-4">Pages</h3>
              <div className="grid grid-cols-2 gap-2">
                {bookData.pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => flipToSpread(Math.floor(index / 2))}
                    className={`relative aspect-[1/1.4] rounded overflow-hidden border-2 transition-all ${
                      index === leftPageIndex || index === rightPageIndex
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={resolveAssetUrl(`${book.folder}/${page.img}`)}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="relative select-none"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              perspective: '2500px'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="relative" style={{
              width: `${baseWidth * 2}px`,
              height: `${pageHeight}px`
            }}>
              <div className="absolute inset-0 flex" style={{ transformStyle: 'preserve-3d' }}>
                {leftPage && (
                  <div
                    className="relative bg-white shadow-2xl"
                    style={{
                      width: `${baseWidth}px`,
                      height: `${pageHeight}px`,
                      boxShadow: '0 0 30px rgba(0,0,0,0.3), inset -5px 0 15px rgba(0,0,0,0.1)',
                    }}
                  >
                    <img
                      src={resolveAssetUrl(`${book.folder}/${leftPage.img}`)}
                      alt={`Page ${leftPageIndex + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="450" height="600"%3E%3Crect fill="%23f3f4f6" width="450" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236b7280" font-size="20"%3EPage Not Found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <HotspotOverlay hotspots={leftPage.hotspots} bookFolder={book.folder} />
                  </div>
                )}

                {rightPage && (
                  <div
                    className={`relative bg-white shadow-2xl ${
                      isFlipping && flipDirection === 'next' ? 'animate-page-flip-next' : ''
                    } ${isFlipping && flipDirection === 'prev' ? 'animate-page-flip-prev' : ''}`}
                    style={{
                      width: `${baseWidth}px`,
                      height: `${pageHeight}px`,
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left center',
                      boxShadow: '0 0 30px rgba(0,0,0,0.3), inset 5px 0 15px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                      <img
                        src={resolveAssetUrl(`${book.folder}/${rightPage.img}`)}
                        alt={`Page ${rightPageIndex + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="450" height="600"%3E%3Crect fill="%23f3f4f6" width="450" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236b7280" font-size="20"%3EPage Not Found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <HotspotOverlay hotspots={rightPage.hotspots} bookFolder={book.folder} />
                    </div>
                  </div>
                )}
              </div>

              <div
                className="absolute top-0 bottom-0 left-1/2 w-2 -ml-1 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.05), rgba(0,0,0,0.15))',
                  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            {currentSpread > 0 && (
              <button
                onClick={prevSpread}
                disabled={isFlipping}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 w-12 h-12 bg-white/90 hover:bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-full transition-all hover:scale-110"
              >
                <ChevronLeft className="w-8 h-8 mx-auto" />
              </button>
            )}

            {currentSpread < totalSpreads - 1 && (
              <button
                onClick={nextSpread}
                disabled={isFlipping}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 w-12 h-12 bg-white/90 hover:bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-full transition-all hover:scale-110"
              >
                <ChevronRight className="w-8 h-8 mx-auto" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1 max-w-2xl overflow-x-auto py-1">
            {Array.from({ length: totalSpreads }).map((_, index) => (
              <button
                key={index}
                onClick={() => flipToSpread(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSpread
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-600 hover:bg-gray-500 w-1.5'
                }`}
                title={`Spread ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
