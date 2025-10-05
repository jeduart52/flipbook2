import { useState, useRef, useEffect } from 'react';
import { Hotspot } from '../types';
import { Volume2, Video, ExternalLink, X, Play, Pause } from 'lucide-react';

interface HotspotOverlayProps {
  hotspots: Hotspot[];
  bookFolder: string;
}

export default function HotspotOverlay({ hotspots, bookFolder }: HotspotOverlayProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === 'link' && hotspot.url) {
      window.open(hotspot.url, '_blank');
    } else {
      setActiveHotspot(hotspot);
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setActiveHotspot(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (activeHotspot?.type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (activeHotspot?.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (activeHotspot?.type === 'audio' && audioRef.current) {
      audioRef.current.play();
    } else if (activeHotspot?.type === 'video' && videoRef.current) {
      videoRef.current.play();
    }
  }, [activeHotspot]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Volume2 className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'link':
        return <ExternalLink className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <>
      {hotspots.map((hotspot, index) => {
        const isSmallHotspot = hotspot.w <= 0.01 && hotspot.h <= 0.01;

        return (
          <button
            key={index}
            onClick={() => handleHotspotClick(hotspot)}
            className={`absolute group ${
              isSmallHotspot
                ? 'w-10 h-10 -ml-5 -mt-5'
                : ''
            }`}
            style={{
              left: `${hotspot.x * 100}%`,
              top: `${hotspot.y * 100}%`,
              width: isSmallHotspot ? undefined : `${hotspot.w * 100}%`,
              height: isSmallHotspot ? undefined : `${hotspot.h * 100}%`,
            }}
            title={hotspot.label}
          >
            <div className={`w-full h-full flex items-center justify-center ${
              isSmallHotspot
                ? 'bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 hover:scale-110'
                : 'bg-blue-500/20 border-2 border-blue-500 hover:bg-blue-500/40'
            } transition-all duration-200`}>
              <span className="text-white drop-shadow-lg">
                {getIcon(hotspot.type)}
              </span>
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {hotspot.label}
            </div>
          </button>
        );
      })}

      {activeHotspot && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-semibold">{activeHotspot.label}</h3>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {activeHotspot.type === 'audio' && (
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={`/${bookFolder}/${activeHotspot.src}`}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full"
                    controls
                  />
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Play
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeHotspot.type === 'video' && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    src={`/${bookFolder}/${activeHotspot.src}`}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full rounded"
                    controls
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
