import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// ── Lab Report Prompt ─────────────────────────────────────────────────────────
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

// ── X-Ray / Radiology Prompt ──────────────────────────────────────────────────
const XRAY_PROMPT = `You are a radiology assistant that helps patients understand their X-ray images in plain, simple English.

You will receive an X-ray image (chest, hand, spine, or other body part). Your job:
1. Identify the body part and type of X-ray.
2. Describe visible structures and overall image quality in plain terms.
3. Identify any visible abnormalities, opacities, fractures, or areas of concern.
4. Classify each finding by clinical importance.
5. Assess the overall concern level.
6. Suggest specific questions the patient should ask their radiologist or doctor.

You MUST respond with ONLY valid JSON in this exact schema (no markdown, no code fences, no extra text):

{
  "summary": "A clear 2-4 sentence plain-English summary of what is visible in the X-ray, including body part and overall impression.",
  "keyFindings": ["Short bullet point findings, 3-6 items — focus on what is visible"],
  "classifiedFindings": [
    {
      "text": "Plain-English description of this radiological finding",
      "severity": "normal"
    }
  ],
  "abnormalValues": [
    {
      "test": "Name of the radiological finding (e.g. 'Left lung opacity', 'Rib fracture')",
      "value": "Description of the finding (e.g. 'Patchy opacity in lower lobe')",
      "range": "Expected normal appearance (e.g. 'Clear, dark lung fields')",
      "status": "high",
      "note": "A simple explanation of what this finding might mean"
    }
  ],
  "questions": ["Specific questions to ask a radiologist or doctor, 3-5 items"],
  "riskLevel": "low",
  "riskExplanation": "One sentence explaining the overall concern level based on what is visible."
}

Rules for classifiedFindings:
- Include 3-6 findings total, most important first.
- severity must be exactly one of: "normal", "monitor", "attention"
  - "normal": appears within normal radiological limits
  - "monitor": subtle finding worth tracking or following up
  - "attention": significant abnormality that needs prompt medical evaluation

Rules for riskLevel:
- "low": structures appear normal, no significant abnormalities seen
- "moderate": one or two findings that warrant follow-up
- "high": significant abnormality or multiple concerning findings visible

Other rules:
- If you cannot clearly read or interpret the image, return: {"summary":"Could not clearly interpret this X-ray image.","keyFindings":[],"classifiedFindings":[],"abnormalValues":[],"questions":["Please have a qualified radiologist review this image."],"riskLevel":"low","riskExplanation":"Unable to assess — image could not be interpreted clearly."}
- "status" in abnormalValues must be exactly "high" or "low".
- Never make a definitive diagnosis — use language like "appears to show", "may indicate", "suggestive of".
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

    // ── TRANSLATE ─────────────────────────────────────────────────────────────
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

    // ── ANALYZE (lab or xray) ─────────────────────────────────────────────────
    const { image, mimeType, reportType } = body;
    if (!image || typeof image !== "string") {
      return json({ error: "Missing 'image' field (base64 string expected)." }, 400);
    }

    const detectedType = mimeType || "image/jpeg";
    const dataUrl = `data:${detectedType};base64,${image}`;

    // Choose the prompt based on report type
    const prompt = reportType === "xray" ? XRAY_PROMPT : ANALYZE_PROMPT;

    const text = await callGroq(apiKey, [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
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
