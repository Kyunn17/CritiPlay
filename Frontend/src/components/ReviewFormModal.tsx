import { useState } from 'react';
import type { RatingAspect, Review } from '../types';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    aspects: RatingAspect[],
    content: string
  ) => void;
  initialData?: Review | null;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: ReviewFormModalProps) {
  const [content, setContent] = useState(
    initialData?.reviewText ?? ''
  );

  const [aspects, setAspects] = useState<RatingAspect[]>([
    {
      aspect: 'Gameplay',
      score: initialData?.ratingGameplay ?? 0
    },
    {
      aspect: 'Visual',
      score: initialData?.ratingVisual ?? 0
    },
    {
      aspect: 'Story',
      score: initialData?.ratingStory ?? 0
    }
  ]);

  if (!isOpen) return null;

  const handleScoreChange = (index: number, newScore: number) => {
    setAspects((currentAspects) =>
      currentAspects.map((aspect, i) =>
        i === index
          ? { ...aspect, score: newScore }
          : aspect
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (aspects.some((aspect) => aspect.score < 1)) {
      alert('Semua rating harus diisi minimal 1.');
      return;
    }

    onSubmit(aspects, content);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {initialData ? 'Edit Jurnal' : 'Tulis Jurnal Baru'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-3">
              Rating (1-10)
            </label>

            <div className="space-y-4">
              {aspects.map((aspect, index) => (
                <div key={aspect.aspect}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-600">
                      {aspect.aspect}
                    </span>

                    <span className="font-bold text-blue-600">
                      {aspect.score}/10
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={aspect.score}
                    onChange={(e) =>
                      handleScoreChange(
                        index,
                        Number(e.target.value)
                      )
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Catatan Jurnal
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:border-blue-500 resize-none"
              placeholder="Tulis pendapatmu tentang game ini..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              {initialData ? 'Update Jurnal' : 'Simpan Jurnal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
