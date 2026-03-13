import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, Tag } from 'lucide-react';
import { READING_MATERIALS } from '../data/readingMaterials';

function ReadingCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{item.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
              >
                <Tag className="inline w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border">
          <BookOpen className="w-6 h-6 text-gray-700" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {item.minutes} min read
        </div>
        <button
          type="button"
          onClick={() => navigate(`/reading/${item.id}`)}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Read now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ReadingHome() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-full p-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reading</h2>
            <p className="text-sm text-gray-700">
              Curated IJRU materials to level up judging accuracy and training insight.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {READING_MATERIALS.map((item) => (
          <ReadingCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
