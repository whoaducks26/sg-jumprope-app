import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footprints, Wand2, Layers, Zap, Sparkles, PersonStanding } from 'lucide-react';
import { TUTORIAL_CATEGORIES } from '../data/tutorials';

const ICONS = {
  footwork: Footprints,
  'rope-manipulation': Wand2,
  multiples: Layers,
  power: Zap,
  releases: Sparkles,
  gymnastics: PersonStanding,
};

function CategoryCard({ category }) {
  const navigate = useNavigate();
  const Icon = ICONS[category.id] || Layers;

  const totalVideos = Object.values(category.levels).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <button
      type="button"
      onClick={() => navigate(`/tutorials/${category.id}`)}
      className="w-full text-left bg-white rounded-xl shadow-sm border hover:shadow-md transition p-5 flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-500">Tutorials</div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {category.title}
        </div>
        <div className="text-sm text-gray-600 mt-1">{category.subtitle}</div>
        <div className="text-sm text-gray-500 mt-2">
          {totalVideos > 0 ? `${totalVideos} videos` : 'Videos coming soon'}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 border">
        <Icon className="w-7 h-7 text-gray-700" />
      </div>
    </button>
  );
}

export default function TutorialsHome() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tutorials</h2>
        <p className="text-sm text-gray-600 mt-1">
          Browse by category, then pick a level (0, 0.5, 1–8) to see the videos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {TUTORIAL_CATEGORIES.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}

