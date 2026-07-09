import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  FileImage,
  X,
  Stethoscope,
  Activity,
  ClipboardList,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Globe,
  ShieldCheck,
  ShieldX,
  ScanLine,
  FlaskConical,
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/ThemeToggle';
import { AnnotatedText } from './components/AnnotatedText';
import { TermModal } from './components/TermModal';
import { SourcesSection } from './components/SourcesSection';
import type { MedicalTerm } from './data/medicalTerms';

// ── Types ────────────────────────────────────────────────────────────────────

type AbnormalValue = {
  test: string;
  value: string;
  range: string;
  status: 'high' | 'low';
  note: string;
};

type ClassifiedFinding = {
  text: string;
  severity: 'normal' | 'monitor' | 'attention';
};

type AnalysisResult = {
  summary: string;
  keyFindings: string[];
  classifiedFindings: ClassifiedFinding[];
  abnormalValues: AbnormalValue[];
  questions: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  riskExplanation: string;
};

type Language = 'en' | 'hi' | 'ta';
type ReportType = 'lab' | 'xray';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English',  native: 'English' },
  { code: 'hi', label: 'Hindi',    native: 'हिंदी'   },
  { code: 'ta', label: 'Tamil',    native: 'தமிழ்'   },
];

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
};

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: 'lab', label: 'Lab Report', description: 'Blood tests, urine, metabolic panels' },
  { type: 'xray', label: 'X-Ray', description: 'Chest, bone, spine radiographs' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeResult(data: Record<string, unknown>): AnalysisResult {
  return {
    summary: String(data.summary ?? ''),
    keyFindings: Array.isArray(data.keyFindings) ? data.keyFindings.map(String) : [],
    classifiedFindings: Array.isArray(data.classifiedFindings)
      ? (data.classifiedFindings as Record<string, string>[])
          .filter(f => ['normal', 'monitor', 'attention'].includes(f.severity))
          .map(f => ({ text: String(f.text ?? ''), severity: f.severity as ClassifiedFinding['severity'] }))
      : [],
    abnormalValues: Array.isArray(data.abnormalValues)
      ? (data.abnormalValues as Record<string, string>[])
          .filter(v => v.status === 'high' || v.status === 'low')
          .map(v => ({
            test: String(v.test ?? ''),
            value: String(v.value ?? ''),
            range: String(v.range ?? ''),
            status: v.status as 'high' | 'low',
            note: String(v.note ?? ''),
          }))
      : [],
    questions: Array.isArray(data.questions) ? data.questions.map(String) : [],
    riskLevel: (['low', 'moderate', 'high'].includes(String(data.riskLevel))
      ? data.riskLevel
      : 'low') as AnalysisResult['riskLevel'],
    riskExplanation: String(data.riskExplanation ?? ''),
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function HealthRiskCard({ level, explanation }: { level: AnalysisResult['riskLevel']; explanation: string }) {
  const config = {
    low:      { bg: 'bg-emerald-50 dark:bg-emerald-900/15', border: 'border-emerald-200 dark:border-emerald-800/40', icon: ShieldCheck, iconColor: 'text-emerald-500 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', badgeText: 'text-emerald-700 dark:text-emerald-300', label: 'Low Risk' },
    moderate: { bg: 'bg-amber-50 dark:bg-amber-900/15',   border: 'border-amber-200 dark:border-amber-800/40',   icon: ShieldAlert, iconColor: 'text-amber-500 dark:text-amber-400',   badgeBg: 'bg-amber-100 dark:bg-amber-900/40',   badgeText: 'text-amber-700 dark:text-amber-300',   label: 'Moderate Risk' },
    high:     { bg: 'bg-red-50 dark:bg-red-900/15',     border: 'border-red-200 dark:border-red-800/40',     icon: ShieldX,     iconColor: 'text-red-500 dark:text-red-400',     badgeBg: 'bg-red-100 dark:bg-red-900/40',     badgeText: 'text-red-700 dark:text-red-300',     label: 'High Risk' },
  }[level];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 animate-fade-in-up ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-900/40 ${config.iconColor}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Health Risk</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${config.badgeBg} ${config.badgeText}`}>
            {config.label}
          </span>
        </div>
      </div>
      {explanation && (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-[52px]">{explanation}</p>
      )}
    </div>
  );
}

function FindingCard({
  finding, index, onTermClick, onTermsFound,
}: {
  finding: ClassifiedFinding;
  index: number;
  onTermClick: (term: MedicalTerm) => void;
  onTermsFound?: (terms: MedicalTerm[]) => void;
}) {
  const config = {
    normal:    { dot: 'bg-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/15',  border: 'border-emerald-100 dark:border-emerald-800/40', text: 'text-emerald-700', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', label: 'Normal'  },
    monitor:   { dot: 'bg-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/15',   border: 'border-amber-100 dark:border-amber-800/40',   text: 'text-amber-700',   badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',   label: 'Monitor'  },
    attention: { dot: 'bg-red-400',     bg: 'bg-red-50 dark:bg-red-900/15',     border: 'border-red-100 dark:border-red-800/40',     text: 'text-red-700',     badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',     label: 'Attention'  },
  }[finding.severity];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border animate-fade-in-up ${config.bg} ${config.border}`}
      style={{ animationDelay: `${0.05 + index * 0.06}s` }}
    >
      <span className={`mt-1.5 shrink-0 w-2.5 h-2.5 rounded-full ${config.dot}`} />
      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <AnnotatedText text={finding.text} onTermClick={onTermClick} onTermsFound={onTermsFound} />
      </span>
      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${config.badge}`}>
        {config.label}
      </span>
    </div>
  );
}

function LanguageSelector({
  language,
  onChange,
  isTranslating,
}: {
  language: Language;
  onChange: (lang: Language) => void;
  isTranslating: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shadow-soft animate-fade-in-up">
      <Globe className="w-4 h-4 text-brand-500 shrink-0" />
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Language</span>
      <div className="flex gap-1.5 ml-auto flex-wrap justify-end">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            disabled={isTranslating}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === lang.code
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-pink-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-slate-600 disabled:opacity-50'
            }`}
          >
            {lang.native}
          </button>
        ))}
      </div>
      {isTranslating && (
        <span className="shrink-0 w-4 h-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Partial<Record<Language, AnalysisResult>>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<ReportType>('lab');

  const { theme, toggleTheme } = useTheme();
  const [activeTerm, setActiveTerm] = useState<MedicalTerm | null>(null);
  const [referencedTerms, setReferencedTerms] = useState<Map<string, MedicalTerm>>(new Map());

  const collectTerms = useCallback((terms: MedicalTerm[]) => {
    if (!terms.length) return;
    setReferencedTerms(prev => {
      let changed = false;
      const next = new Map(prev);
      for (const t of terms) {
        if (!next.has(t.term)) {
          next.set(t.term, t);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayResult = language === 'en' ? result : (translations[language] ?? result);

  // Translate when language changes (if not already cached)
  useEffect(() => {
    if (!result || language === 'en') return;
    if (translations[language]) return;

    const run = async () => {
      setIsTranslating(true);
      setTranslateError(null);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const endpoint = `${supabaseUrl}/functions/v1/analyze-report`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify({
            action: 'translate',
            content: result,
            language: LANGUAGE_NAMES[language],
          }),
        });

        if (!response.ok) {
          let detail = `Translation failed (${response.status})`;
          try { const b = await response.json(); if (b?.error) detail = b.error; } catch { /* noop */ }
          throw new Error(detail);
        }

        const data = await response.json();
        const translated = normalizeResult(data as Record<string, unknown>);
        // Keep test/value/range/status untouched from the original
        translated.abnormalValues = translated.abnormalValues.map((v, i) => ({
          ...v,
          test: result.abnormalValues[i]?.test ?? v.test,
          value: result.abnormalValues[i]?.value ?? v.value,
          range: result.abnormalValues[i]?.range ?? v.range,
          status: result.abnormalValues[i]?.status ?? v.status,
        }));
        translated.riskLevel = result.riskLevel;

        setTranslations(prev => ({ ...prev, [language]: translated }));
      } catch (err) {
        setTranslateError(err instanceof Error ? err.message : 'Translation failed.');
        setLanguage('en');
      } finally {
        setIsTranslating(false);
      }
    };

    run();
  }, [language, result, translations]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, or PDF screenshot).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please upload a file under 10 MB.');
      return;
    }
    setError(null);
    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
      setTranslations({});
      // Preserve user's language selection from the home page
      setReferencedTerms(new Map());
    };
    reader.readAsDataURL(file);
    setFileName(file.name);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setImage(null);
    setFileName('');
    setResult(null);
    setError(null);
    setTranslations({});
    setLanguage('en');
    setReferencedTerms(new Map());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    const base64Data = image.split(',')[1] || '';

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('The analysis service is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      }

      const endpoint = `${supabaseUrl}/functions/v1/analyze-report`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({ action: 'analyze', image: base64Data, mimeType: imageMimeType, reportType }),
      });

      if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try { const b = await response.json(); if (b?.error) detail = b.error; } catch { /* noop */ }
        throw new Error(detail);
      }

      const data = await response.json();
      if (!data || typeof data.summary !== 'string') {
        throw new Error('Received an invalid response from the analysis service.');
      }

      setResult(normalizeResult(data as Record<string, unknown>));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while analyzing your report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => removeImage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/85 backdrop-blur-lg border-b border-pink-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft">
              <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none tracking-tight">MediExplain</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Understand your report</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {image && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-pink-50 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Start over</span>
              </button>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20">

        {/* Hero */}
        {!image && (
          <div className="text-center mb-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/50 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI-assisted medical imaging
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2">
              {reportType === 'xray'
                ? <>Understand your X-ray<br className="hidden sm:block" /> in plain language</>
                : <>Understand your lab report<br className="hidden sm:block" /> in plain language</>}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {reportType === 'xray'
                ? "Upload an X-ray image and get a plain-language explanation of what\u2019s visible, areas of concern, and questions to ask your doctor."
                : 'Upload a photo of your lab report and get a clear summary, flagged values, and questions to bring to your doctor.'}
            </p>
          </div>
        )}

        {/* Upload zone */}
        {!image && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

            {/* Report type toggle */}
            <div className="flex gap-2 p-1 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {REPORT_TYPES.map(rt => (
                <button
                  key={rt.type}
                  onClick={() => setReportType(rt.type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                    reportType === rt.type
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-soft'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {rt.type === 'lab'
                    ? <FlaskConical className="w-4 h-4 shrink-0" />
                    : <ScanLine className="w-4 h-4 shrink-0" />}
                  <span>{rt.label}</span>
                </button>
              ))}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center group ${
                isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.01]' : 'border-pink-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-400 hover:bg-pink-50/50 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                {reportType === 'xray'
                  ? <ScanLine className="w-7 h-7 text-brand-600 dark:text-brand-300" strokeWidth={2} />
                  : <Upload className="w-7 h-7 text-brand-600 dark:text-brand-300" strokeWidth={2} />}
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {reportType === 'xray' ? 'Tap to upload your X-ray' : 'Tap to upload your report'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">or drag and drop an image here</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">JPG, PNG · up to 10 MB</p>
            </button>
            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center animate-fade-in">{error}</p>}

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: ShieldAlert, label: 'Private & secure' },
                { icon: Activity, label: 'Instant analysis' },
                { icon: ClipboardList, label: 'Plain language' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                >
                  <b.icon className="w-5 h-5 text-brand-500 dark:text-brand-300" strokeWidth={2} />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Language selector on home page */}
            <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '0.28s' }}>
              <LanguageSelector language={language} onChange={setLanguage} isTranslating={false} />
            </div>
          </div>
        )}

        {/* Preview + Analyze */}
        {image && !result && (
          <div className="animate-fade-in-up">
            <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shadow-card">
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={image} alt="Medical report preview" className="w-full max-h-[420px] object-contain bg-slate-50 dark:bg-slate-900" />
              <div className="px-4 py-3 border-t border-pink-50 dark:border-slate-700 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-brand-500 dark:text-brand-300 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate">{fileName || 'Uploaded report'}</span>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center animate-fade-in">{error}</p>}

            <button
              onClick={analyze}
              disabled={isAnalyzing}
              className="w-full mt-5 h-14 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-card hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all duration-300 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <span className="relative flex w-5 h-5">
                    <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-white/40" />
                    <span className="relative inline-flex w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </span>
                  {reportType === 'xray' ? 'Analyzing your X-ray…' : 'Analyzing your report…'}
                </>
              ) : (
                <>
                  {reportType === 'xray' ? <ScanLine className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                  {reportType === 'xray' ? 'Analyze X-Ray' : 'Analyze Report'}
                </>
              )}
            </button>

            {isAnalyzing && (
              <div className="mt-6 space-y-3 animate-fade-in">
                {(reportType === 'xray'
                  ? ['Processing X-ray image', 'Sending to AI radiologist', 'Identifying areas of concern', 'Preparing your explanation']
                  : ['Extracting text from image', 'Sending to AI for analysis', 'Identifying abnormal values', 'Preparing your summary']
                ).map((step, i) => (
                  <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.4}s` }}>
                    <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-300" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {error && !isAnalyzing && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={analyze} className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2">
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {result && image && displayResult && (
          <div className="space-y-4">

            {/* Thumbnail + status row */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shadow-soft animate-fade-in-up">
              <img src={image} alt="Report" className="w-14 h-14 rounded-lg object-cover border border-pink-100 dark:border-slate-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{fileName || 'Your report'}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Analysis complete
                </p>
              </div>
              <button
                onClick={reset}
                className="text-sm font-medium text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 px-3 py-2 rounded-lg hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">New report</span>
              </button>
            </div>

            {/* Language selector */}
            <LanguageSelector language={language} onChange={setLanguage} isTranslating={isTranslating} />

            {translateError && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center animate-fade-in">{translateError}</p>
            )}

            {/* Health Risk */}
            <HealthRiskCard level={displayResult.riskLevel} explanation={displayResult.riskExplanation} />

            {/* Key Findings */}
            {displayResult.classifiedFindings.length > 0 && (
              <Section icon={<Sparkles className="w-5 h-5" />} title="Key Findings" number="1" delay={0.05}>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(['normal', 'monitor', 'attention'] as const).map(s => {
                    const counts = { normal: '🟢 Normal', monitor: '🟡 Monitor', attention: '🔴 Attention' };
                    const n = displayResult.classifiedFindings.filter(f => f.severity === s).length;
                    if (n === 0) return null;
                    return (
                      <span key={s} className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {counts[s]} · {n}
                      </span>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {displayResult.classifiedFindings.map((f, i) => (
                    <FindingCard key={i} finding={f} index={i} onTermClick={setActiveTerm} onTermsFound={collectTerms} />
                  ))}
                </div>
              </Section>
            )}

            {/* Report Summary */}
            <Section icon={<ClipboardList className="w-5 h-5" />} title="Report Summary" number="2" delay={0.08}>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <AnnotatedText text={displayResult.summary} onTermClick={setActiveTerm} onTermsFound={collectTerms} />
              </p>
            </Section>

            {/* Abnormal Values */}
            <Section icon={<Activity className="w-5 h-5" />} title="Abnormal Values" number="3" delay={0.11}>
              <div className="space-y-3">
                {displayResult.abnormalValues.length === 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      No abnormal values detected. All results appear within normal ranges.
                    </p>
                  </div>
                )}
                {displayResult.abnormalValues.map((v, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3.5 animate-fade-in-up ${
                      v.status === 'high'
                        ? 'border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/15'
                        : 'border-pink-200 dark:border-slate-700 bg-pink-50 dark:bg-slate-800/60'
                    }`}
                    style={{ animationDelay: `${0.13 + i * 0.06}s` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{v.test}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Normal range: {v.range}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-pink-100 dark:bg-slate-700 text-pink-700 dark:text-pink-300'
                        }`}
                      >
                        {v.status === 'high' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {v.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <AnnotatedText text={v.note} onTermClick={setActiveTerm} onTermsFound={collectTerms} />
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Questions */}
            <Section icon={<HelpCircle className="w-5 h-5" />} title="Questions to Ask Your Doctor" number="4" delay={0.14}>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Bring these questions to your next appointment.</p>
              <div className="space-y-2.5">
                {displayResult.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/60 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/40 animate-fade-in-up"
                    style={{ animationDelay: `${0.16 + i * 0.06}s` }}
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Disclaimer */}
            <Section icon={<ShieldAlert className="w-5 h-5" />} title="Disclaimer" number="5" delay={0.17} accent="amber">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-800 dark:text-slate-100">This is not a medical diagnosis. Please consult a healthcare professional.</strong>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    MediExplain is an informational tool and <strong className="text-slate-700 dark:text-slate-200">not a medical device</strong>. It does not diagnose, treat, or replace professional medical advice.
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    The analysis is generated by AI for educational purposes and may contain errors. Always consult a licensed healthcare provider before making decisions about your health.
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                    By using this tool you acknowledge that the output is not a substitute for professional medical evaluation.
                  </p>
                </div>
              </div>
            </Section>

            {/* Sources */}
            <SourcesSection terms={Array.from(referencedTerms.values())} />

            {/* CTA */}
            <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={reset}
                className="w-full py-3.5 rounded-2xl border-2 border-brand-200 dark:border-brand-800/50 text-brand-700 dark:text-brand-300 font-semibold flex items-center justify-center gap-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
              >
                Analyze another report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HeartPulse className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">MediExplain</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
            This is not a medical diagnosis. Please consult a healthcare professional.
          </p>
        </div>
      </footer>

      {activeTerm && <TermModal term={activeTerm} onClose={() => setActiveTerm(null)} />}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon, title, number, children, delay = 0, accent = 'brand',
}: {
  icon: React.ReactNode;
  title: string;
  number: string;
  children: React.ReactNode;
  delay?: number;
  accent?: 'brand' | 'amber';
}) {
  const accentClasses = accent === 'amber'
    ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-100 dark:border-amber-800/40'
    : 'bg-white dark:bg-slate-800 border-pink-100 dark:border-slate-700';
  const iconBg = accent === 'amber'
    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
    : 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300';

  return (
    <section
      className={`rounded-2xl border shadow-soft p-4 sm:p-5 animate-fade-in-up ${accentClasses}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-slate-300 dark:text-slate-600 shrink-0">{number}</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}
