import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-2.0-flash-lite";

async function getApiKey(): Promise<string | null> {
  const envKey = Deno.env.get("GEMINI_API_KEY");
  if (envKey) return envKey;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/vault.decrypted_secrets?name=eq.GEMINI_API_KEY&select=decrypted_secret`, {
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) return data[0].decrypted_secret;
    return null;
  } catch {
    return null;
  }
}

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

    const detectedType = mimeType || "image/jpeg";

    const apiKey = await getApiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: detectedType,
                data: image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    const geminiResponse = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return new Response(
        JSON.stringify({
          error: `Gemini API returned status ${geminiResponse.status}.`,
          details: errText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();

    const textContent =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return new Response(
        JSON.stringify({ error: "Gemini returned no content." }),
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
