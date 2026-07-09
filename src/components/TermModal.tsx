import { useEffect, useState } from 'react';
import { X, BookOpen, HeartPulse, Info, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import type { MedicalTerm } from '../data/medicalTerms';

type WikiSummary = {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
};

function extractWikiTitle(url: string): string {
  try {
    const parts = url.split('/wiki/');
    return parts[1] ? decodeURIComponent(parts[1]) : '';
  } catch {
    return '';
  }
}

export function TermModal({ term, onClose }: { term: MedicalTerm; onClose: () => void }) {
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState(false);

  // Fetch Wikipedia summary on mount / term change
  useEffect(() => {
    const title = extractWikiTitle(term.wikipediaUrl);
    if (!title) return;

    setWiki(null);
    setWikiLoading(true);
    setWikiError(false);

    const controller = new AbortController();

    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal: controller.signal }
    )
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json() as Promise<WikiSummary>;
      })
      .then(data => {
        setWiki(data);
        setWikiLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setWikiError(true);
          setWikiLoading(false);
        }
      });

    return () => controller.abort();
  }, [term.wikipediaUrl]);

  // Keyboard / scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
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
        className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-card border border-pink-100 dark:border-slate-700 max-h-[92vh] overflow-y-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg flex items-center justify-between px-5 py-4 border-b border-pink-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{term.term}</h3>
              <a
                href={term.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-brand-500 dark:text-brand-400 hover:underline flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                Wikipedia
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Wikipedia thumbnail + live extract */}
          {wikiLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading Wikipedia article…
            </div>
          )}

          {wikiError && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 border border-amber-100 dark:border-amber-800/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Could not load Wikipedia article. Check your connection.
            </div>
          )}

          {wiki && (
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 overflow-hidden">
              {wiki.thumbnail && (
                <img
                  src={wiki.thumbnail.source}
                  alt={wiki.title}
                  className="w-full max-h-48 object-cover object-top"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide">
                    From Wikipedia
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{wiki.extract}</p>
                <a
                  href={term.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={e => e.stopPropagation()}
                >
                  Read full article on Wikipedia
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-pink-100 dark:border-slate-700" />

          {/* Built-in explanations */}
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

          {/* Full Wikipedia CTA */}
          <a
            href={term.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 pt-2 border-t border-pink-100 dark:border-slate-700 mt-2"
            onClick={e => e.stopPropagation()}
          >
            <BookOpen className="w-4 h-4" />
            Full Wikipedia Article
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
