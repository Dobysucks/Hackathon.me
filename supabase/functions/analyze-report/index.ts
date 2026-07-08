import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "google/gemma-4-26b-a4b-it:free";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are a medical report assistant that helps patients understand their lab reports in plain, simple English.

You will receive an image of a medical report. Your job:
1. Extract and read all text from the image (OCR).
2. Explain the report in simple English that a non-medical person can understand.
3. Identify any abnormal values (values outside the normal reference range shown on the report).
4. Generate practical questions the patient should ask their doctor.

You MUST respond with ONLY valid JSON in this exact schema (no markdown, no code fences, no extra text):

{
  "summary": "A clear 2-4 sentence plain-English summary of the overall report.",
  "keyFindings": ["Short bullet point findings, 3-6 items"],
  "abnormalValues": [
    {
      "test": "Name of the test",
      "value": "The patient's value with units",
      "range": "The normal reference range from the report",
      "status": "high" or "low",
      "note": "A simple explanation of what this means"
    }
  ],
  "questions": ["Specific questions to ask a doctor, 3-5 items"]
}

Rules:
- If you cannot read the image clearly, return: {"summary": "Could not read the report clearly.", "keyFindings": [], "abnormalValues": [], "questions": []}
- "status" must be exactly "high" or "low" (lowercase).
- If there are no abnormal values, return an empty array for "abnormalValues".
- Keep all language simple and non-technical. Avoid jargon.
- Do NOT include a disclaimer in the JSON; the frontend handles that.
- Do NOT include any text outside the JSON object.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { image, mimeType } = body;

    if (!image || typeof image !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'image' field (base64 string expected)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const detectedType = mimeType || "image/jpeg";
    const dataUrl = `data:${detectedType};base64,${image}`;

    const payload = {
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 2048,
      temperature: 0.4,
    };

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://mediexplain.app",
        "X-Title": "MediExplain",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return new Response(
        JSON.stringify({
          error: `OpenRouter returned status ${response.status}.`,
          details: errText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const textContent = data?.choices?.[0]?.message?.content;

    if (!textContent) {
      return new Response(
        JSON.stringify({ error: "Claude returned no content." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(textContent);
    } catch {
      const cleaned = textContent.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred.", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
