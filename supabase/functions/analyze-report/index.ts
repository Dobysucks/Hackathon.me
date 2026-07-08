import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const ANALYZE_PROMPT = `You are a medical report assistant that helps patients understand their lab reports in plain, simple English.

You will receive an image of a medical report. Your job:
1. Extract and read all text from the image (OCR).
2. Explain the report in simple English that a non-medical person can understand.
3. Identify any abnormal values (values outside the normal reference range shown on the report).
4. Classify each key finding by severity.
5. Assess the overall health risk level.
6. Generate practical questions the patient should ask their doctor.

You MUST respond with ONLY valid JSON in this exact schema (no markdown, no code fences, no extra text):

{
  "summary": "A clear 2-4 sentence plain-English summary of the overall report.",
  "keyFindings": ["Short bullet point findings, 3-6 items"],
  "classifiedFindings": [
    {
      "text": "Plain-English description of this finding",
      "severity": "normal"
    }
  ],
  "abnormalValues": [
    {
      "test": "Name of the test",
      "value": "The patient's value with units",
      "range": "The normal reference range from the report",
      "status": "high",
      "note": "A simple explanation of what this means"
    }
  ],
  "questions": ["Specific questions to ask a doctor, 3-5 items"],
  "riskLevel": "low",
  "riskExplanation": "One sentence explaining the overall risk level."
}

Rules for classifiedFindings:
- Include 3-6 findings total, most important first.
- severity must be exactly one of: "normal", "monitor", "attention"
  - "normal": value is within healthy range
  - "monitor": slightly outside range or borderline — worth watching
  - "attention": significantly abnormal — needs prompt medical attention

Rules for riskLevel:
- "low": 0-1 minor abnormalities, nothing critical
- "moderate": 1-2 abnormalities or one moderate deviation
- "high": 3+ abnormalities OR any critically abnormal value

Other rules:
- If you cannot read the image clearly, return: {"summary":"Could not read the report clearly.","keyFindings":[],"classifiedFindings":[],"abnormalValues":[],"questions":[],"riskLevel":"low","riskExplanation":"Unable to assess risk — report could not be read."}
- "status" in abnormalValues must be exactly "high" or "low".
- Keep all language simple and non-technical.
- Do NOT include a disclaimer in the JSON.
- Do NOT include any text outside the JSON object.`;

async function callGroq(apiKey: string, messages: unknown[]): Promise<string> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 2048,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content.");
  return content;
}

function parseJSON(text: string): unknown {
  // 1. Try raw parse first
  try { return JSON.parse(text); } catch { /* continue */ }

  // 2. Strip markdown code fences
  const stripped = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(stripped); } catch { /* continue */ }

  // 3. Extract the outermost {...} block (handles conversational preamble/postamble)
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }

  throw new Error("Could not parse JSON from model response.");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed. Use POST." }, 405);
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) return json({ error: "Groq API key is not configured." }, 500);

    const body = await req.json();
    const action = body.action ?? "analyze";

    // ── TRANSLATE ────────────────────────────────────────────────────────────
    if (action === "translate") {
      const { content, language } = body;
      if (!content || !language) {
        return json({ error: "Missing 'content' or 'language' for translation." }, 400);
      }

      const prompt = `Translate the JSON below from English to ${language}. Output ONLY the translated JSON object — no explanation, no markdown, no code fences, no extra text before or after.

Rules:
- Keep the EXACT JSON structure and all keys unchanged.
- Translate ONLY these string values: summary, classifiedFindings[].text, keyFindings[], abnormalValues[].note, questions[], riskExplanation.
- Do NOT translate: test names (abnormalValues[].test), values, ranges, or enum strings ("high","low","normal","monitor","attention","moderate").

${JSON.stringify(content)}`;

      const translated = await callGroq(apiKey, [{ role: "user", content: prompt }]);
      const parsed = parseJSON(translated);
      return json(parsed);
    }

    // ── ANALYZE ──────────────────────────────────────────────────────────────
    const { image, mimeType } = body;
    if (!image || typeof image !== "string") {
      return json({ error: "Missing 'image' field (base64 string expected)." }, 400);
    }

    const detectedType = mimeType || "image/jpeg";
    const dataUrl = `data:${detectedType};base64,${image}`;

    const text = await callGroq(apiKey, [
      {
        role: "user",
        content: [
          { type: "text", text: ANALYZE_PROMPT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ]);

    const parsed = parseJSON(text);
    return json(parsed);

  } catch (err) {
    console.error("Edge function error:", err);
    return json({ error: "An unexpected error occurred.", details: String(err) }, 500);
  }
});
