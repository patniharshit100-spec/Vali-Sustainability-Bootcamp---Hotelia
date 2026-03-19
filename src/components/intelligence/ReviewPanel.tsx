import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import type { Review } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';

interface ReviewPanelProps {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

const sentimentVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  positive: 'success',
  neutral: 'warning',
  negative: 'danger',
};

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ reviews }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Recent Reviews</h3>
        <span className="text-xs text-slate-500">{reviews.filter((r) => !r.responded).length} need response</span>
      </div>
      <div className="divide-y divide-slate-100">
        {reviews.map((review) => (
          <div key={review.id} className="p-5">
            <div className="flex items-start gap-3">
              <Avatar name={review.guestName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">{review.guestName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{review.platform}</span>
                    <Badge variant={sentimentVariant[review.sentiment]} size="sm">{review.sentiment}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                {!review.responded && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<MessageSquare size={13} />}
                    className="mt-3"
                  >
                    Draft Response
                  </Button>
                )}
                {review.responded && (
                  <p className="text-xs text-green-600 mt-2 font-medium">✓ Responded</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
