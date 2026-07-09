import { useEffect } from 'react';
import { X, BookOpen, HeartPulse, Info, ExternalLink } from 'lucide-react';
import type { MedicalTerm } from '../data/medicalTerms';

export function TermModal({ term, onClose }: { term: MedicalTerm; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={term.term}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-card border border-pink-100 dark:border-slate-700 max-h-[85vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg flex items-center justify-between px-5 py-4 border-b border-pink-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{term.term}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Simple Explanation
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{term.simple}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide mb-1">
              Why It Matters
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{term.whyItMatters}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide mb-1">
              Normal Role in the Body
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{term.normalRole}</p>
          </div>

          <a
            href={term.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 pt-2 border-t border-pink-100 dark:border-slate-700 mt-2"
          >
            <BookOpen className="w-4 h-4" />
            Learn More (Wikipedia)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
