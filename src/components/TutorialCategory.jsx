import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, PlayCircle } from 'lucide-react';
import { getTutorialCategory, TUTORIAL_LEVELS } from '../data/tutorials';

function LevelRow({ level, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border hover:shadow-md transition p-5 flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-500">Level</div>
        <div className="text-2xl font-bold text-gray-900 leading-tight">{level}</div>
        <div className="text-sm text-gray-500 mt-1">
          {count > 0 ? `${count} videos` : 'No videos yet'}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2 text-gray-600">
        <PlayCircle className="w-6 h-6" />
      </div>
    </button>
  );
}

export default function TutorialCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const category = getTutorialCategory(categoryId);

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <button
          type="button"
          onClick={() => navigate('/tutorials')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">{category.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{category.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {TUTORIAL_LEVELS.map((lv) => {
          const count = category.levels[lv]?.length || 0;
          return (
            <LevelRow
              key={lv}
              level={lv}
              count={count}
              onClick={() => navigate(`/tutorials/${category.id}/level/${encodeURIComponent(lv)}`)}
            />
          );
        })}
      </div>
    </div>
  );
}

