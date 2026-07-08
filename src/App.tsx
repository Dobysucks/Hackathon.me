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
} from 'lucide-react';

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
    low:      { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck, iconColor: 'text-emerald-500', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', label: 'Low Risk' },
    moderate: { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: ShieldAlert, iconColor: 'text-amber-500',   badgeBg: 'bg-amber-100',   badgeText: 'text-amber-700',   label: 'Moderate Risk' },
    high:     { bg: 'bg-red-50',     border: 'border-red-200',     icon: ShieldX,     iconColor: 'text-red-500',     badgeBg: 'bg-red-100',     badgeText: 'text-red-700',     label: 'High Risk' },
  }[level];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 animate-fade-in-up ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 ${config.iconColor}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Health Risk</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${config.badgeBg} ${config.badgeText}`}>
            {config.label}
          </span>
        </div>
      </div>
      {explanation && (
        <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">{explanation}</p>
      )}
    </div>
  );
}

function FindingCard({ finding, index }: { finding: ClassifiedFinding; index: number }) {
  const config = {
    normal:    { dot: 'bg-emerald-400', bg: 'bg-emerald-50',  border: 'border-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'Normal'  },
    monitor:   { dot: 'bg-amber-400',   bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700',   label: 'Monitor'  },
    attention: { dot: 'bg-red-400',     bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-700',     badge: 'bg-red-100 text-red-700',     label: 'Attention'  },
  }[finding.severity];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border animate-fade-in-up ${config.bg} ${config.border}`}
      style={{ animationDelay: `${0.05 + index * 0.06}s` }}
    >
      <span className={`mt-1.5 shrink-0 w-2.5 h-2.5 rounded-full ${config.dot}`} />
      <span className="flex-1 text-sm text-slate-700 leading-relaxed">{finding.text}</span>
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
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-sky-100 shadow-soft animate-fade-in-up">
      <Globe className="w-4 h-4 text-brand-500 shrink-0" />
      <span className="text-xs font-semibold text-slate-500 shrink-0">Language</span>
      <div className="flex gap-1.5 ml-auto flex-wrap justify-end">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            disabled={isTranslating}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === lang.code
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-sky-50 text-slate-600 hover:bg-sky-100 disabled:opacity-50'
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
      setLanguage('en');
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
        body: JSON.stringify({ action: 'analyze', image: base64Data, mimeType: imageMimeType }),
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-sky-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft">
              <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none tracking-tight">MediExplain</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Understand your report</p>
            </div>
          </div>
          {image && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-50"
            >
              <RotateCcw className="w-4 h-4" />
              Start over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20">

        {/* Hero */}
        {!image && (
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI-assisted report reading
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight mb-2">
              Understand your medical report
              <br className="hidden sm:block" /> in plain language
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Upload a photo of your lab report and get a clear summary, flagged values, and questions to bring to your doctor.
            </p>
          </div>
        )}

        {/* Upload zone */}
        {!image && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center group ${
                isDragging ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-sky-200 bg-white hover:border-brand-400 hover:bg-sky-50/50'
              }`}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Upload className="w-7 h-7 text-brand-600" strokeWidth={2} />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">Tap to upload your report</p>
              <p className="text-sm text-slate-400">or drag and drop an image here</p>
              <p className="text-xs text-slate-400 mt-3">JPG, PNG · up to 10 MB</p>
            </button>
            {error && <p className="mt-3 text-sm text-red-600 text-center animate-fade-in">{error}</p>}

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: ShieldAlert, label: 'Private & secure' },
                { icon: Activity, label: 'Instant analysis' },
                { icon: ClipboardList, label: 'Plain language' },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white border border-sky-100 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                >
                  <b.icon className="w-5 h-5 text-brand-500" strokeWidth={2} />
                  <span className="text-[11px] font-medium text-slate-500 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview + Analyze */}
        {image && !result && (
          <div className="animate-fade-in-up">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-sky-100 shadow-card">
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={image} alt="Medical report preview" className="w-full max-h-[420px] object-contain bg-slate-50" />
              <div className="px-4 py-3 border-t border-sky-50 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-sm text-slate-600 font-medium truncate">{fileName || 'Uploaded report'}</span>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600 text-center animate-fade-in">{error}</p>}

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
                  Analyzing your report…
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  Analyze Report
                </>
              )}
            </button>

            {isAnalyzing && (
              <div className="mt-6 space-y-3 animate-fade-in">
                {['Extracting text from image', 'Sending to AI for analysis', 'Identifying abnormal values', 'Preparing your summary'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.4}s` }}>
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <span className="text-sm text-slate-500">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {error && !isAnalyzing && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    <button onClick={analyze} className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 underline underline-offset-2">
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
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-sky-100 shadow-soft animate-fade-in-up">
              <img src={image} alt="Report" className="w-14 h-14 rounded-lg object-cover border border-sky-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{fileName || 'Your report'}</p>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Analysis complete
                </p>
              </div>
              <button
                onClick={reset}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">New report</span>
              </button>
            </div>

            {/* Language selector */}
            <LanguageSelector language={language} onChange={setLanguage} isTranslating={isTranslating} />

            {translateError && (
              <p className="text-xs text-red-500 text-center animate-fade-in">{translateError}</p>
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
                      <span key={s} className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {counts[s]} · {n}
                      </span>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {displayResult.classifiedFindings.map((f, i) => (
                    <FindingCard key={i} finding={f} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Report Summary */}
            <Section icon={<ClipboardList className="w-5 h-5" />} title="Report Summary" number="2" delay={0.08}>
              <p className="text-sm text-slate-600 leading-relaxed">{displayResult.summary}</p>
            </Section>

            {/* Abnormal Values */}
            <Section icon={<Activity className="w-5 h-5" />} title="Abnormal Values" number="3" delay={0.11}>
              <div className="space-y-3">
                {displayResult.abnormalValues.length === 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      No abnormal values detected. All results appear within normal ranges.
                    </p>
                  </div>
                )}
                {displayResult.abnormalValues.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-3.5 animate-fade-in-up"
                    style={{
                      animationDelay: `${0.13 + i * 0.06}s`,
                      borderColor: v.status === 'high' ? '#fecaca' : '#bae6fd',
                      backgroundColor: v.status === 'high' ? '#fef2f2' : '#f0f9ff',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{v.test}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Normal range: {v.range}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'high' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {v.status === 'high' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {v.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{v.note}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Questions */}
            <Section icon={<HelpCircle className="w-5 h-5" />} title="Questions to Ask Your Doctor" number="4" delay={0.14}>
              <p className="text-sm text-slate-500 mb-3">Bring these questions to your next appointment.</p>
              <div className="space-y-2.5">
                {displayResult.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/60 border border-brand-100 animate-fade-in-up"
                    style={{ animationDelay: `${0.16 + i * 0.06}s` }}
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Disclaimer */}
            <Section icon={<ShieldAlert className="w-5 h-5" />} title="Disclaimer" number="5" delay={0.17} accent="amber">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">This is not a medical diagnosis. Please consult a healthcare professional.</strong>
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    MediExplain is an informational tool and <strong className="text-slate-700">not a medical device</strong>. It does not diagnose, treat, or replace professional medical advice.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The analysis is generated by AI for educational purposes and may contain errors. Always consult a licensed healthcare provider before making decisions about your health.
                  </p>
                  <p className="text-xs text-slate-400 pt-1">
                    By using this tool you acknowledge that the output is not a substitute for professional medical evaluation.
                  </p>
                </div>
              </div>
            </Section>

            {/* CTA */}
            <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={reset}
                className="w-full py-3.5 rounded-2xl border-2 border-brand-200 text-brand-700 font-semibold flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
              >
                Analyze another report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-sky-100 bg-white/60">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HeartPulse className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-slate-600">MediExplain</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            This is not a medical diagnosis. Please consult a healthcare professional.
          </p>
        </div>
      </footer>
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
  const accentClasses = accent === 'amber' ? 'bg-amber-50 border-amber-100' : 'bg-white border-sky-100';
  const iconBg = accent === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600';

  return (
    <section
      className={`rounded-2xl border shadow-soft p-4 sm:p-5 animate-fade-in-up ${accentClasses}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-slate-300 shrink-0">{number}</span>
          <h3 className="text-base font-bold text-slate-800 truncate">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}
