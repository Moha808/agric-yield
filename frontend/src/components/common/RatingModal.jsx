import React, { useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export function RatingSection({ onSaveRating, initialRating = 0, initialComment = '' }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please tap a star rating (1 to 5).');
      return;
    }
    if (onSaveRating) {
      onSaveRating(rating, comment);
    }
    setSubmitted(true);
    toast.success(t('feedback_saved'));
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center mt-4">
        <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{t('feedback_saved')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mt-5">
      <h4 className="text-xs font-black uppercase tracking-wider text-stone-700">
        {t('rate_accuracy')}
      </h4>
      <p className="text-[11px] text-stone-500 mb-2.5">
        {t('rate_subtext')}
      </p>

      {/* Stars */}
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 touch-target transition-transform hover:scale-125 focus:outline-none cursor-pointer"
          >
            <Star
              className={`w-7 h-7 ${
                (hoverRating || rating) >= star
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-stone-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs font-bold text-amber-800 ml-1">
            {rating} / 5
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('comment_placeholder')}
        rows={2}
        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      />

      <div className="mt-2.5 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs touch-target cursor-pointer"
        >
          {t('submit_feedback_btn')}
        </button>
      </div>
    </div>
  );
}
