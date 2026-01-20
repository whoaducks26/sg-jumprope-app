import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { READING_MATERIALS } from '../data/readingMaterials';

export default function ReadingViewer() {
  const { readingId } = useParams();
  const navigate = useNavigate();
  const item = READING_MATERIALS.find((doc) => doc.id === readingId);
  const viewerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await viewerRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  if (!item) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <button
          type="button"
          onClick={() => navigate('/reading')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> Back to reading
        </button>
        <div className="mt-4 text-gray-900 font-semibold">Reading material not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <button
          type="button"
          onClick={() => navigate('/reading')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">{item.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Open in new tab <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {isFullscreen ? (
              <>
                Exit fullscreen <Minimize2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Fullscreen <Maximize2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div ref={viewerRef} className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <iframe
          title={item.title}
          src={item.fileUrl}
          className="w-full h-[75vh]"
        />
      </div>
    </div>
  );
}
