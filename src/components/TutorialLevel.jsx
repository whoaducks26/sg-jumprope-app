import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ExternalLink, PlayCircle } from 'lucide-react';
import { getTutorialCategory } from '../data/tutorials';

function isYouTubeUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('youtube.com') ||
      u.hostname.includes('youtu.be') ||
      u.hostname.includes('youtube-nocookie.com')
    );
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    const id = u.searchParams.get('v');
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function VideoCard({ video }) {
  const embedUrl = useMemo(() => {
    if (!video?.url) return null;
    if (isYouTubeUrl(video.url)) return getYouTubeEmbedUrl(video.url);
    return null;
  }, [video?.url]);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {embedUrl ? (
        <div className="aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video bg-gray-50 flex items-center justify-center">
          <PlayCircle className="w-10 h-10 text-gray-400" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">{video.title}</div>
            {video.notes && <div className="text-sm text-gray-600 mt-1">{video.notes}</div>}
          </div>
          {video.url && (
            <a
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              Open <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TutorialLevel() {
  const { categoryId, levelId } = useParams();
  const navigate = useNavigate();
  const category = getTutorialCategory(categoryId);
  const level = decodeURIComponent(levelId || '');

  if (!category) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <button
          type="button"
          onClick={() => navigate('/tutorials')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> Back to tutorials
        </button>
        <div className="mt-4 text-gray-900 font-semibold">Tutorial category not found.</div>
      </div>
    );
  }

  const videos = category.levels[level] || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <button
          type="button"
          onClick={() => navigate(`/tutorials/${category.id}`)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
          {category.title} — Level {level}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {videos.length > 0 ? `${videos.length} videos` : 'No videos for this level yet.'}
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <p className="text-gray-700 font-medium">Coming soon</p>
          <p className="text-sm text-gray-500 mt-1">
            Add video links in the tutorials data file and they’ll show up here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

