import { useState } from 'react';

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="fill-amber-400 flex-shrink-0">
    <path d="M7 0L8.57 5H14L9.5 8.1L11.1 13L7 9.8L2.9 13L4.5 8.1L0 5H5.43L7 0Z" />
  </svg>
);

const QuoteIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

interface Review {
  title: string;
  rating: number;
  startDate: string;
  endDate: string;
  reviewText: string;
  tags: string[];
  earned: string;
  rate: string;
  hours: number;
  clientName?: string;
  clientTitle?: string;
}

export const reviews: Review[] = [
  {
    title: 'Management Consulting, Salesforce AI Agent',
    rating: 5.0,
    startDate: 'Nov 2025',
    endDate: 'Feb 2026',
    reviewText:
      'John was instrumental in the successful deployment of our Salesforce Sales Cloud and Agentforce environment. He expertly navigated the project as it scaled from a core CRM setup into a comprehensive CRM overhaul, including full website integration. His ability to effectively communicate with his technical skills on the SEO implementation were equally impressive, ensuring our digital presence aligned perfectly with the new backend architecture. John combines deep technical proficiency with a strategic business mindset. He is the ideal partner for anyone looking to leverage Salesforce and AI agents to drive real growth.',
    tags: ['Committed to Quality', 'Solution Oriented', 'Clear Communicator', 'Accountable for Outcomes'],
    earned: '$2,666.40',
    rate: '$44.44/hr',
    hours: 60,
  },
  {
    title: 'Salesforce Setup and Gong.io API Integration',
    rating: 5.0,
    startDate: 'Feb 2025',
    endDate: 'Apr 2025',
    reviewText:
      'John was the key player that brought this project across the finish line. He made a critical pivot in integrating Google Calendar and Sale Rabbit prior to the Gong API integration. He was able to accommodate that scope of work in addition to taking lead on the API Gong & Sales Cloud Integration. He successfully implement the Mobile Sales Cloud and led all training with the sales team.',
    tags: ['Detail Oriented', 'Solution Oriented', 'Committed to Quality', 'Accountable for Outcomes'],
    earned: '$18,450.00',
    rate: '$75.00/hr',
    hours: 246,
  },
  {
    title: 'Salesforce Implementation',
    rating: 5.0,
    startDate: 'Oct 2024',
    endDate: 'Oct 2024',
    reviewText:
      'John helped spin-up a Salesforce instance from scratch, along with being instrumental in other startup specific projects including getting initial legal work completed, making operational plans for our go-to-market strategy, and organizing product-related ideas in a timeline format.',
    tags: ['Verified', 'Salesforce Implementation'],
    earned: '',
    rate: '',
    hours: 0,
    clientName: 'Donald C.',
    clientTitle: 'Founder of Pineapple Co.',
  },
];

export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.reviewText.length > 200;

  return (
    <div className="group bg-white border border-[#0F172B]/15 rounded-2xl overflow-hidden shadow-sm hover:border-[#0F172B]/30 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{review.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} />
              ))}
            </div>
            <span className="font-bold text-slate-900 text-xs ml-1">{review.rating.toFixed(1)}</span>
          </div>
          <span className="w-px h-4 bg-slate-300" aria-hidden="true" />
          <span className="text-slate-500">
            {review.startDate} – {review.endDate}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Review text */}
        <div className="relative">
          <QuoteIcon size={20} className="text-blue-200 absolute -top-1 -left-1" />
          <p
            className={`text-slate-700 leading-relaxed italic pl-6 ${
              !expanded && isLong ? 'line-clamp-3' : ''
            }`}
          >
            {review.reviewText}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium pl-6 transition-colors"
            >
              {expanded ? 'See less' : 'See more'}
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Client attribution */}
        {review.clientName && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-800">– {review.clientName}</p>
            {review.clientTitle && (
              <p className="text-xs text-slate-500">{review.clientTitle}</p>
            )}
          </div>
        )}

        {/* Stats */}
        {(review.earned || review.rate || review.hours > 0) && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Earned</p>
            <p className="font-semibold text-slate-700 text-sm">{review.earned}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Hourly Rate</p>
            <p className="font-semibold text-slate-700 text-sm">{review.rate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Hours</p>
            <p className="font-semibold text-slate-700 text-sm">{review.hours}</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export function Reviews({ compact = false }: { compact?: boolean }) {
  return (
    <section className="py-20 lg:py-28 shadow-[0_4px_6px_-1px_rgba(15,23,43,0.30)] bg-[#eff6ff69]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">5.0 / 5.0</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0f172b]">
            Client Reviews
          </h2>
          <p className="text-slate-600">
            Verified reviews from enterprise Salesforce and AI engagements.
          </p>
        </div>

        {/* Review Cards */}
        <div className={`grid ${compact ? 'md:grid-cols-2' : 'lg:grid-cols-2'} gap-8 max-w-5xl mx-auto`}>
          {reviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
        </div>

        {/* Upwork Attribution */}
        <div className="text-center mt-10">
          <a
            href="https://www.upwork.com/freelancers/~01b06b3ac60cf2f30c"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span>Verified on Upwork</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}