import { useEffect, useMemo } from 'react';
import { buildTermMatcher, type MedicalTerm } from '../data/medicalTerms';

const { regex, lookup } = buildTermMatcher();

/**
 * Renders plain report text, wrapping any recognized medical term in a
 * clickable highlighted span. Clicking a term calls onTermClick with the
 * matched dictionary entry (used to open the explanation modal) and also
 * reports it via onTermsFound so callers can build a "Sources" list.
 */
export function AnnotatedText({
  text,
  onTermClick,
  onTermsFound,
  className = '',
}: {
  text: string;
  onTermClick: (term: MedicalTerm) => void;
  onTermsFound?: (terms: MedicalTerm[]) => void;
  className?: string;
}) {
  const { parts, found } = useMemo(() => {
    if (!text) return { parts: [], found: [] as MedicalTerm[] };
    const nodes: Array<{ type: 'text' | 'term'; value: string; term?: MedicalTerm }> = [];
    const foundTerms: MedicalTerm[] = [];
    const seen = new Set<string>();

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(regex);
    while ((match = re.exec(text)) !== null) {
      const entry = lookup.get(match[0].toLowerCase());
      if (!entry) continue;
      if (match.index > lastIndex) {
        nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      nodes.push({ type: 'term', value: match[0], term: entry });
      if (!seen.has(entry.term)) {
        seen.add(entry.term);
        foundTerms.push(entry);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      nodes.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return { parts: nodes, found: foundTerms };
  }, [text]);

  useEffect(() => {
    if (found.length && onTermsFound) onTermsFound(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === 'term' && part.term ? (
          <button
            key={i}
            type="button"
            onClick={() => onTermClick(part.term!)}
            className="term-highlight"
          >
            {part.value}
          </button>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </span>
  );
}
