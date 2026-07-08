import { useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';

type AbnormalValue = {
  test: string;
  value: string;
  range: string;
  status: 'high' | 'low';
  note: string;
};

type AnalysisResult = {
  summary: string;
  keyFindings: string[];
  abnormalValues: AbnormalValue[];
  questions: string[];
};

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        throw new Error(
          'The analysis service is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
        );
      }

      const endpoint = `${supabaseUrl}/functions/v1/analyze-report`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: imageMimeType,
        }),
      });

      if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try {
          const errBody = await response.json();
          if (errBody?.error) detail = errBody.error;
        } catch {
          // response wasn't JSON, use default message
        }
        throw new Error(detail);
      }

      const data = await response.json();

      if (!data || typeof data.summary !== 'string') {
        throw new Error('Received an invalid response from the analysis service.');
      }

      const normalized: AnalysisResult = {
        summary: data.summary,
        keyFindings: Array.isArray(data.keyFindings) ? data.keyFindings : [],
        abnormalValues: Array.isArray(data.abnormalValues)
          ? data.abnormalValues
              .filter((v: Record<string, string>) => v.status === 'high' || v.status === 'low')
              .map((v: Record<string, string>) => ({
              test: String(v.test ?? ''),
              value: String(v.value ?? ''),
              range: String(v.range ?? ''),
              status: v.status as 'high' | 'low',
              note: String(v.note ?? ''),
            }))
          : [],
        questions: Array.isArray(data.questions) ? data.questions : [],
      };

      setResult(normalized);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while analyzing your report. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    removeImage();
  };

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
              <h1 className="text-lg font-bold text-slate-800 leading-none tracking-tight">
                MediExplain
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Understand your report
              </p>
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
              Upload a photo of your lab report and get a clear summary, flagged values, and
              questions to bring to your doctor.
            </p>
          </div>
        )}

        {/* Upload zone */}
        {!image && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center group ${
                isDragging
                  ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                  : 'border-sky-200 bg-white hover:border-brand-400 hover:bg-sky-50/50'
              }`}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Upload className="w-7 h-7 text-brand-600" strokeWidth={2} />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">
                Tap to upload your report
              </p>
              <p className="text-sm text-slate-400">
                or drag and drop an image here
              </p>
              <p className="text-xs text-slate-400 mt-3">
                JPG, PNG · up to 10 MB
              </p>
            </button>
            {error && (
              <p className="mt-3 text-sm text-red-600 text-center animate-fade-in">
                {error}
              </p>
            )}

            {/* Trust badges */}
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
                  <span className="text-[11px] font-medium text-slate-500 leading-tight">
                    {b.label}
                  </span>
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
              <img
                src={image}
                alt="Medical report preview"
                className="w-full max-h-[420px] object-contain bg-slate-50"
              />
              <div className="px-4 py-3 border-t border-sky-50 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-sm text-slate-600 font-medium truncate">
                  {fileName || 'Uploaded report'}
                </span>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 text-center animate-fade-in">
                {error}
              </p>
            )}

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
                {['Extracting text from image (OCR)', 'Sending to Gemini for analysis', 'Identifying abnormal values', 'Preparing your summary'].map(
                  (step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-fade-in"
                      style={{ animationDelay: `${i * 0.4}s` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                      </div>
                      <span className="text-sm text-slate-500">{step}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {error && !isAnalyzing && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    <button
                      onClick={analyze}
                      className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && image && (
          <div className="space-y-4">
            {/* Preview thumbnail */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-sky-100 shadow-soft animate-fade-in-up">
              <img
                src={image}
                alt="Report"
                className="w-14 h-14 rounded-lg object-cover border border-sky-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{fileName || 'Your report'}</p>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Analysis complete
                </p>
              </div>
              <button
                onClick={reset}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">New report</span>
              </button>
            </div>

            {/* 1. Report Summary */}
            <Section
              icon={<ClipboardList className="w-5 h-5" />}
              title="Report Summary"
              number="1"
              delay={0.05}
            >
              <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Key findings
                </p>
                {result.keyFindings.map((finding, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{finding}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* 2. Abnormal Values */}
            <Section
              icon={<Activity className="w-5 h-5" />}
              title="Abnormal Values"
              number="2"
              delay={0.1}
            >
              <div className="space-y-3">
                {result.abnormalValues.length === 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      No abnormal values detected. All results appear within normal ranges.
                    </p>
                  </div>
                )}
                {result.abnormalValues.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-3.5 animate-fade-in-up"
                    style={{
                      animationDelay: `${0.15 + i * 0.08}s`,
                      borderColor: v.status === 'high' ? '#fecaca' : '#bae6fd',
                      backgroundColor: v.status === 'high' ? '#fef2f2' : '#f0f9ff',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{v.test}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Normal range: {v.range}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {v.status === 'high' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {v.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{v.note}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 3. Questions to Ask Your Doctor */}
            <Section
              icon={<HelpCircle className="w-5 h-5" />}
              title="Questions to Ask Your Doctor"
              number="3"
              delay={0.15}
            >
              <p className="text-sm text-slate-500 mb-3">
                Bring these questions to your next appointment to get the most out of your visit.
              </p>
              <div className="space-y-2.5">
                {result.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/60 border border-brand-100 animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + i * 0.06}s` }}
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* 4. Disclaimer */}
            <Section
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Disclaimer"
              number="4"
              delay={0.2}
              accent="amber"
            >
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
                    The analysis is generated by AI for educational purposes and may contain errors or misread values from your report. Always consult a licensed healthcare provider before making decisions about your health.
                  </p>
                  <p className="text-xs text-slate-400 pt-1">
                    By using this tool you acknowledge that the output is not a substitute for professional medical evaluation.
                  </p>
                </div>
              </div>
            </Section>

            {/* CTA */}
            <div
              className="pt-2 animate-fade-in-up"
              style={{ animationDelay: '0.25s' }}
            >
              <button
                onClick={reset}
                className="w-full h-13 py-3.5 rounded-2xl border-2 border-brand-200 text-brand-700 font-semibold flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
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

function Section({
  icon,
  title,
  number,
  children,
  delay = 0,
  accent = 'brand',
}: {
  icon: React.ReactNode;
  title: string;
  number: string;
  children: React.ReactNode;
  delay?: number;
  accent?: 'brand' | 'amber';
}) {
  const accentClasses =
    accent === 'amber'
      ? 'bg-amber-50 border-amber-100'
      : 'bg-white border-sky-100';
  const iconBg =
    accent === 'amber'
      ? 'bg-amber-100 text-amber-600'
      : 'bg-brand-100 text-brand-600';

  return (
    <section
      className={`rounded-2xl border shadow-soft p-5 animate-fade-in-up ${accentClasses}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">{number}</span>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}
