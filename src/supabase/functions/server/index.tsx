import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import OpenAI from "openai";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const app = new Hono();

const ROUTE_PREFIX = "/make-server-07a007e1";

const MODELS = {
  chat: "gpt-4",
  scope: "gpt-4o",
  analyzer: "gpt-4o",
  valueProp: "gpt-4o",
} as const;

const SCOPE_LIMITS = {
  Goal: 500,
  Problem: 750,
  Requirement: 1000,
} as const;

// ============================================================================
// TYPES
// ============================================================================

type ScopeType = "Goal" | "Problem" | "Requirement" | "Synthesis";

type QuoteData = {
  formData: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    website?: string;
    workEmail?: string;
    mobilePhone?: string;
    projectDescription?: string;
    projectOverview?: string;
    powerUps?: string[];
    deliveryTeam?: string;
    selectedCRMs?: string[];
    selectedClouds?: string[];
    selectedIntegrations?: string[];
    selectedAITools?: string[];
    additionalModules?: string[];
  };
  estimatedWeeks?: number;
  hoursPerWeek?: number;
  adjustedHours?: number;
  finalHourlyRate?: number;
  powerUpRate?: number;
  totalCost?: number;
  pdfBase64?: string | null;
};

type AnalyzerExtraction = {
  projectDescription: string;
  rawGoals: string[];
  rawProblems: string[];
  rawRequirements: string[];
  suggestedInfrastructure: string[];
  suggestedServices: string[];
  suggestedPowerUps: string[];
};

type ValuePropResponse = {
  valueStatement: string;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.options("*", (c) => c.body(null, 204));

// ============================================================================
// SHARED HELPERS
// ============================================================================

function getOpenAIClient(): OpenAI {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

function getTodayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asArrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function dedupePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function parseJsonResponse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw?.trim()) return fallback;

  let cleaned = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  cleaned = cleaned
    .replace(/^```(?:json|JSON)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "");

  // Handle cases where the AI wraps output in backticks without newlines
  if (cleaned.startsWith("`") && cleaned.endsWith("`")) {
    cleaned = cleaned.slice(1, -1);
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Raw JSON content (first 500 chars):", raw?.substring(0, 500));
    return fallback;
  }
}

function normalizeBulletList(input: string): string {
  if (!input?.trim()) return "";

  const items = input
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/^[\s•*\-–—]+/, "")
        .replace(/["'`“”]/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .map((line) => `• ${line}`);

  return dedupePreserveOrder(items).join("\n");
}

function truncateAtSentence(text: string, limit: number): string {
  if (!text || text.length <= limit) return text;

  const sliced = text.slice(0, limit).trim();

  // Find the last sentence-ending punctuation (., !, ?) within the limit
  const lastPeriod = sliced.lastIndexOf(".");
  const lastExclamation = sliced.lastIndexOf("!");
  const lastQuestion = sliced.lastIndexOf("?");
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > 0) {
    return sliced.slice(0, lastSentenceEnd + 1).trim();
  }

  // No sentence boundary found — cut at the last whitespace to avoid partial words
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > 0) {
    return sliced.slice(0, lastSpace).trim();
  }

  return sliced;
}

function enforceBulletCharLimit(text: string, limit: number): string {
  if (!text || text.length <= limit) return text;

  const bullets = text.split("\n").filter(Boolean);
  const kept: string[] = [];

  for (const bullet of bullets) {
    const candidate = kept.length
      ? `${kept.join("\n")}\n${bullet}`
      : bullet;

    if (candidate.length <= limit) {
      kept.push(bullet);
      continue;
    }

    if (kept.length === 0) {
      kept.push(truncateAtSentence(bullet, limit));
    }
    break;
  }

  return kept.join("\n").trim();
}

function sanitizeBase64Pdf(input: string | null | undefined): string {
  const value = asString(input);
  if (!value) return "";
  return value.includes("base64,") ? value.split("base64,")[1] : value;
}

function sanitizeEntityName(input: string): string {
  return input.replace(/[\/\\?%*:|"<>]/g, "-").trim();
}

function buildQuoteDateString(date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}.${dd}.${yyyy}`;
}

function determineEntityName(quoteData: QuoteData): string {
  const companyName = asString(quoteData?.formData?.companyName).trim();
  const firstName = asString(quoteData?.formData?.firstName).trim();
  const lastName = asString(quoteData?.formData?.lastName).trim();

  if (companyName) return companyName;

  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Client";
}

function handleApiError(c: any, error: unknown, fallbackMessage: string) {
  console.error("Server Error:", error);

  // @ts-ignore
  const isQuotaError =
    // @ts-ignore
    error?.status === 429 ||
    // @ts-ignore
    error?.error?.code === "insufficient_quota" ||
    // @ts-ignore
    error?.message?.includes?.("quota");

  if (isQuotaError) {
    return c.json(
      { error: "quota_exceeded", message: "AI Usage Limit Reached" },
      429,
    );
  }

  // @ts-ignore
  return c.json({ error: error?.message || fallbackMessage }, 500);
}

// ============================================================================
// SHARED PROMPT HELPERS
// ============================================================================

async function rewriteScopeSection(
  openai: OpenAI,
  type: Exclude<ScopeType, "Synthesis">,
  text: string,
): Promise<string> {
  if (!text?.trim()) return "";

  const sectionInstructionMap: Record<
    Exclude<ScopeType, "Synthesis">,
    string
  > = {
    Goal:
      "Rewrite as concise SMART business outcomes — each must be Specific, Measurable, Achievable, Relevant, and Time-aware. Do not invent dates, percentages, or KPIs that are not supported by the input. If a measurement is missing, use conservative measurable phrasing.",
    Problem:
      "Rewrite as concise root-cause-oriented business problem statements. Each must identify the underlying cause — inefficiency, risk, delay, quality gap, manual work, missing automation, or process breakdown — not just the symptom.",
    Requirement:
      "Rewrite as BABOK-compliant implementation-ready requirements. For functional requests, use clear user-story language (As a [role], I need [capability], so that [outcome]). For non-functional requests, preserve them as measurable non-functional requirements with observable acceptance criteria.",
  };

  const completion = await openai.chat.completions.create({
    model: MODELS.scope,
    temperature: 0.15,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `
You are a BKT Advisory scope-writing engine.

SECTION TYPE: ${type}

GLOBAL OUTPUT RULES:
- Output plain text only.
- Output ONLY the rewritten section content.
- No headers.
- No markdown fences.
- No numbering.
- No conversational filler.
- Every item must appear on its own line.
- Every line must begin exactly with: • 
- Use digits instead of written-out numbers.
- Do not use quotation marks.
- Do not hallucinate facts not present in the input.
- If the input has only 1 item, still return 1 bullet for consistency.

SECTION-SPECIFIC RULE:
${sectionInstructionMap[type]}
        `.trim(),
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "";
  const normalized = normalizeBulletList(raw);
  return enforceBulletCharLimit(normalized, SCOPE_LIMITS[type]);
}

async function synthesizeStructuredScope(
  openai: OpenAI,
  text: string,
): Promise<string> {
  if (!text?.trim()) return "";

  const completion = await openai.chat.completions.create({
    model: MODELS.scope,
    temperature: 0.18,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `
You are an elite Salesforce Consultant, Solution Architect, and Business Analyst.

Write a succinctly articulate, single-paragraph executive summary of the project in the tone of an experienced, expert tech consultant. MAXIMUM 400 CHARACTERS. Do not use headers, bullet points, or lists.

OUTPUT RULES:
- Output plain text only — one continuous paragraph.
- STRICT 400-character maximum (including spaces and punctuation).
- Use digits instead of written-out numbers.
- Do not use quotation marks.
- Do not invent facts not present in the input.
- Do not include section headers, bullet points, numbered lists, or any structured formatting.
        `.trim(),
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const raw = (completion.choices[0]?.message?.content || "").trim();
  return truncateAtSentence(raw, 400);
}

async function extractDocumentFacts(
  openai: OpenAI,
  text: string,
): Promise<AnalyzerExtraction> {
  const completion = await openai.chat.completions.create({
    model: MODELS.analyzer,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are an expert Solutions Architect.

Analyze the provided project specification or RFP text and extract structured data into a strictly valid JSON object.

RETURN JSON ONLY IN THIS EXACT SHAPE:
{
  "projectDescription": "Concise executive summary of the project, max 150 words",
  "rawGoals": ["fact-based goal or success metric", "fact-based goal or success metric"],
  "rawProblems": ["fact-based problem or pain point", "fact-based problem or pain point"],
  "rawRequirements": ["fact-based functional or technical requirement", "fact-based functional or technical requirement"],
  "suggestedInfrastructure": ["Salesforce", "AWS", "Slack"],
  "suggestedServices": ["Implementation", "Custom Development", "Data Migration"],
  "suggestedPowerUps": ["Business Analyst", "Developer"]
}

VALID POWER-UP LABELS (use ONLY these exact strings):
- "Business Analyst" — for projects requiring requirements gathering, stakeholder analysis, or process mapping.
- "Project Manager" — for projects with complex timelines, multiple workstreams, or cross-functional coordination.
- "Customer Success Manager" — for projects involving onboarding, training, adoption, or post-launch support.
- "Developer" — for projects requiring custom code, Apex, LWC, or integration development.
- "Solutions Architect" — for projects requiring system design, multi-cloud architecture, or enterprise-grade planning.
- "AI/ML Engineers" — for projects involving AI models, machine learning pipelines, NLP, or intelligent automation.

RULES:
- rawGoals, rawProblems, and rawRequirements must be short extracted facts, not polished prose.
- Do not format bullets.
- Do not add headers.
- Do not include markdown.
- Do not invent missing goals, problems, or requirements.
- suggestedInfrastructure and suggestedServices may be inferred conservatively only when strongly implied by the document.
- suggestedPowerUps must only contain values from the VALID POWER-UP LABELS list above, inferred conservatively from the document content.
- If information is missing, return empty arrays.
        `.trim(),
      },
      {
        role: "user",
        content: `Document Content:\n\n${text.substring(0, 15000)}`,
      },
    ],
  });

  const parsed = parseJsonResponse<Partial<AnalyzerExtraction>>(
    completion.choices[0]?.message?.content,
    {},
  );

  return {
    projectDescription: asString(parsed.projectDescription),
    rawGoals: asArrayOfStrings(parsed.rawGoals),
    rawProblems: asArrayOfStrings(parsed.rawProblems),
    rawRequirements: asArrayOfStrings(parsed.rawRequirements),
    suggestedInfrastructure: dedupePreserveOrder(
      asArrayOfStrings(parsed.suggestedInfrastructure),
    ),
    suggestedServices: dedupePreserveOrder(
      asArrayOfStrings(parsed.suggestedServices),
    ),
    suggestedPowerUps: dedupePreserveOrder(
      asArrayOfStrings(parsed.suggestedPowerUps),
    ),
  };
}

// ============================================================================
// ROUTE: AI CHATBOT
// ============================================================================

app.post(`${ROUTE_PREFIX}/chat`, async (c) => {
  try {
    const body = await c.req.json();
    const currentPage = asString(body?.current_page, "Unknown");
    const currentDate = asString(body?.current_date, getTodayISODate());
    const projectGoals = asString(body?.project_goals, "User needs assistance");

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are the BKT Advisory AI Assistant for the Tech Project Estimator.

Context:
- Page: ${currentPage}
- Date: ${currentDate}

User Goal/Input:
${projectGoals}

Instructions:
- If the user provides project details to autofill or suggests a configuration, you MUST output ONLY a valid JSON object containing arrays for the suggested infrastructure and services. Use these exact keys: selectedCRMs, selectedClouds, selectedIntegrations, selectedAITools, additionalModules. Do not include markdown formatting (like \`\`\`json), code fences, or any conversational filler — output raw JSON only. When outputting JSON, bypass the STRUCTURED PROJECT DESCRIPTION FORMAT rule entirely.
- If the user asks about services, provide a brief summary.
- If the user expresses interest in booking, scheduling, or speaking with John, append the hidden tag :::OPEN_BOOKING::: to the end of the response.
- Keep responses helpful, professional, and tech-forward.
- Always use digits instead of written-out numbers.
- Do not use quotation marks in the output.

AVAILABLE TEAM ROLES (Power-Ups):
When recommending team composition, use these exact labels:
- Business Analyst ($4/hr) — requirements gathering, stakeholder analysis, process mapping
- Project Manager ($5/hr) — timeline management, cross-functional coordination
- Customer Success Manager ($4/hr) — onboarding, training, adoption, post-launch support
- Developer ($5/hr) — custom code, Apex, LWC, integration development
- Solutions Architect ($8/hr) — system design, multi-cloud architecture, enterprise planning
- AI/ML Engineers ($6/hr) — AI models, machine learning, NLP, intelligent automation

STRUCTURED PROJECT DESCRIPTION FORMAT:
PROJECT SCOPE & OBJECTIVES
CURRENT TECH STACK
PROBLEMS
REQUIREMENTS
AUTOMATIONS & INTEGRATIONS
TIMELINE & CONSTRAINTS

OUTPUT CONSTRAINTS:
1. RESTRICTED PAGES:
   If Page is Scope or Contact Info, do not output the structured project description format.
   Instead, acknowledge the input, confirm the requirements are noted, or ask clarifying questions.
2. ALLOWED PAGES:
   The structured project description format may only be generated if Page is IT Infrastructure, Services, or Team & Extras.
          `.trim(),
        },
        {
          role: "user",
          content: projectGoals || "Hello",
        },
      ],
    });

    const outputText = (completion.choices[0]?.message?.content || "").trim();

    if (!outputText) {
      console.error("Empty response from OpenAI:", completion);
      return c.json({ error: "OpenAI returned empty response" }, 500);
    }

    return c.json({
      content: outputText,
      // Detect structured scope output using a reliable regex that checks
      // for canonical section headers the frontend uses to offer "Insert Scope".
      isJson: /PROJECT SCOPE|OBJECTIVES|TECH STACK/i.test(outputText),
    });
  } catch (error) {
    return handleApiError(c, error, "Unknown server error");
  }
});

// ============================================================================
// ROUTE: SCOPE REFINER
// ============================================================================

app.post(`${ROUTE_PREFIX}/refine-scope`, async (c) => {
  try {
    const body = await c.req.json();
    const text = asString(body?.text);
    const type = asString(body?.type) as ScopeType;

    if (!text.trim()) {
      return c.json({ error: "Text is required" }, 400);
    }

    if (!["Goal", "Problem", "Requirement", "Synthesis"].includes(type)) {
      return c.json({ error: "Invalid scope type" }, 400);
    }

    const openai = getOpenAIClient();

    const content =
      type === "Synthesis"
        ? await synthesizeStructuredScope(openai, text)
        : await rewriteScopeSection(openai, type, text);

    if (!content) {
      return c.json({ error: "OpenAI returned empty response" }, 500);
    }

    return c.json({ content });
  } catch (error) {
    return handleApiError(c, error, "Unknown server error");
  }
});

// ============================================================================
// ROUTE: DOCUMENT ANALYZER
// ============================================================================

app.post(`${ROUTE_PREFIX}/analyze-document`, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("name") as string | null) ?? "Unnamed Document";

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // 25 MB ceiling — enforced server-side only
    if (file.size > 25 * 1024 * 1024) {
      return c.json({ error: "File exceeds 25 MB limit. Please upload a smaller document." }, 413);
    }

    const mime = file.type;
    let text = "";

    if (mime === "text/plain") {
      text = await file.text();
    } else if (mime === "application/pdf") {
      // @ts-ignore — Deno npm-compat import resolved at runtime
      const { default: pdfParse } = await import("npm:pdf-parse/lib/pdf-parse.js");
      const buffer = await file.arrayBuffer();
      // @ts-ignore
      const parsed = await pdfParse(Buffer.from(buffer));
      text = parsed.text ?? "";
    } else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // @ts-ignore — Deno npm-compat import resolved at runtime
      const { default: mammoth } = await import("npm:mammoth");
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value ?? "";
    } else {
      return c.json(
        { error: `Unsupported file type: ${mime}. Please upload a PDF, DOCX, or TXT file.` },
        415,
      );
    }

    if (!text.trim()) {
      return c.json(
        { error: "Could not extract text from this document. It may be image-only or corrupted." },
        422,
      );
    }

    // Single truncation point — server only
    const truncated = text.length > 15_000 ? text.slice(0, 15_000) : text;

    const openai = getOpenAIClient();

    console.log(`Analyzing document: ${fileName}`);

    // Step 1: Extract raw facts.
    const extracted = await extractDocumentFacts(openai, truncated);

    // Step 2: Rewrite extracted goals/problems/requirements through the same
    // canonical writer used by /refine-scope so the style stays consistent.
    // Each call is wrapped in .catch() so a single section failure doesn't
    // break the entire analysis pipeline.
    const [goals, problems, requirements] = await Promise.all([
      rewriteScopeSection(openai, "Goal", extracted.rawGoals.join("\n"))
        .catch((err) => {
          console.error("Goal rewrite failed during document analysis:", err);
          return "";
        }),
      rewriteScopeSection(openai, "Problem", extracted.rawProblems.join("\n"))
        .catch((err) => {
          console.error("Problem rewrite failed during document analysis:", err);
          return "";
        }),
      rewriteScopeSection(
        openai,
        "Requirement",
        extracted.rawRequirements.join("\n"),
      )
        .catch((err) => {
          console.error("Requirement rewrite failed during document analysis:", err);
          return "";
        }),
    ]);

    return c.json({
      projectDescription: extracted.projectDescription,
      goals,
      problems,
      requirements,
      suggestedInfrastructure: extracted.suggestedInfrastructure,
      suggestedServices: extracted.suggestedServices,
      suggestedPowerUps: extracted.suggestedPowerUps,
    });
  } catch (error) {
    return handleApiError(c, error, "Analysis failed");
  }
});

// ============================================================================
// ROUTE: GENERATE PROJECT SUMMARY (from scope fields, no document upload)
// ============================================================================

app.post(`${ROUTE_PREFIX}/generate-summary`, async (c) => {
  try {
    const body = await c.req.json();
    const goals = asString(body?.goals);
    const problems = asString(body?.problems);
    const requirements = asString(body?.requirements);

    if (!goals.trim() && !problems.trim() && !requirements.trim()) {
      return c.json({ error: "At least one scope field is required" }, 400);
    }

    const openai = getOpenAIClient();

    console.log("Generating project summary from scope fields");

    const completion = await openai.chat.completions.create({
      model: MODELS.analyzer,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a seasoned tech consultant with deep expertise in CRM platforms, cloud architecture, and enterprise digital transformation.

Given a client's goals, problems, and requirements, write a summarize the project description in a articulate manner.

RULES:
- STRICT MAXIMUM: 400 characters (including spaces). Count carefully. Never exceed this limit.
- Write in the succinctly articulate tone of an experienced, expert tech consultant — confident, precise, jargon-appropriate but not verbose.
- Synthesize across all three inputs into a single cohesive narrative.
- Focus on the business outcome and technical approach.
- Do not repeat bullet points verbatim — distill and synthesize.
- Do not include headers, markdown, bullet points, or line breaks in the summary.
- Output strictly valid JSON only.

RESPONSE SHAPE:
{ "projectDescription": "Your concise executive summary here." }
          `.trim(),
        },
        {
          role: "user",
          content: `
Goals:
${goals || "Not specified"}

Problems:
${problems || "Not specified"}

Requirements:
${requirements || "Not specified"}
          `.trim(),
        },
      ],
    });

    const parsed = parseJsonResponse<{ projectDescription: string }>(
      completion.choices[0]?.message?.content,
      { projectDescription: "" },
    );

    // Server-side safeguard: enforce 400 character limit even if the AI overshoots
    if (parsed.projectDescription.length > 400) {
      parsed.projectDescription = truncateAtSentence(parsed.projectDescription, 400);
    }

    return c.json(parsed);
  } catch (error) {
    return handleApiError(c, error, "Failed to generate project summary");
  }
});

// ============================================================================
// ROUTE: VALUE PROPOSITION GENERATOR
// ============================================================================

app.post(`${ROUTE_PREFIX}/generate-value-prop`, async (c) => {
  try {
    const body = await c.req.json();
    const problems = asString(body?.problems, "Not specified");
    const goals = asString(body?.goals, "Not specified");
    const infrastructure = asString(body?.infrastructure, "Not specified");
    const services = asString(body?.services, "Not specified");

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: MODELS.valueProp,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a Strategic Consultant.

Based on the client's problems, goals, services, and proposed tech stack, write a compelling, specific 1-sentence value proposition for the final quote header.

RULES:
- Maximum 35 words.
- Focus on the business outcome.
- Keep the language specific and executive-ready.
- Output strictly valid JSON only.

RESPONSE SHAPE:
{ "valueStatement": "Your value proposition here." }
          `.trim(),
        },
        {
          role: "user",
          content: `
Problems: ${problems}
Goals: ${goals}
Proposed Infrastructure: ${infrastructure}
Services: ${services}
          `.trim(),
        },
      ],
    });

    const parsed = parseJsonResponse<ValuePropResponse>(
      completion.choices[0]?.message?.content,
      { valueStatement: "" },
    );

    return c.json(parsed);
  } catch (error) {
    return handleApiError(c, error, "Failed to generate value prop");
  }
});

// ============================================================================
// ROUTE: SUBMIT QUOTE
// ============================================================================

app.post(`${ROUTE_PREFIX}/submit-quote`, async (c) => {
  try {
    const quoteData = (await c.req.json()) as QuoteData;

    if (!quoteData?.formData) {
      return c.json({ error: "Invalid quote payload" }, 400);
    }

    const dateStr = buildQuoteDateString(new Date());
    const entityName = determineEntityName(quoteData);
    const sanitizedEntityName = sanitizeEntityName(entityName);
    const fileName = `BKT_Quote - ${sanitizedEntityName} - ${dateStr}.pdf`;

    const googleScriptUrl =
      "https://script.google.com/macros/s/AKfycbyUYuS-Bq_AjA_zw6aqHSyLdNzbQifN7McyV6_RF0dtLhvk7b1fntqOWjaqH1nrZI1_/exec";

    const googlePayload = {
      formData: {
        date: new Date().toISOString(),
        website: asString(quoteData.formData.website),
        companyName: asString(quoteData.formData.companyName),
        firstName: asString(quoteData.formData.firstName),
        lastName: asString(quoteData.formData.lastName),
        workEmail: asString(quoteData.formData.workEmail),
        mobilePhone: asString(quoteData.formData.mobilePhone),
        estimatedWeeks: quoteData.estimatedWeeks ?? null,
        hoursPerWeek: quoteData.hoursPerWeek ?? 25,
        adjustedHours: quoteData.adjustedHours ?? null,
        finalHourlyRate: quoteData.finalHourlyRate ?? null,
        totalCost: quoteData.totalCost ?? null,
        powerUpRate: quoteData.powerUpRate ?? null,
        powerUps: asArrayOfStrings(quoteData.formData.powerUps).join(", "),
        deliveryTeam: asString(quoteData.formData.deliveryTeam),
        projectOverview:
          asString(quoteData.formData.projectDescription) ||
          asString(quoteData.formData.projectOverview),
      },
      fileData: {
        name: fileName,
        base64: sanitizeBase64Pdf(quoteData.pdfBase64),
      },
    };

    // Always send lead data to Google Apps Script; PDF may be absent for large files.
    if (googleScriptUrl.includes("script.google.com")) {
      console.log("📤 Sending data to Google Script...");

      const googleResponse = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(googlePayload),
      });

      if (!googleResponse.ok) {
        const errorText = await googleResponse.text();
        console.error(
          `❌ Google Script Failed: ${googleResponse.status} ${googleResponse.statusText}`,
        );
        console.error(`Response body: ${errorText}`);
      } else {
        const responseText = await googleResponse.text();
        console.log(`✅ Google Script Success: ${responseText}`);
      }
    } else {
      console.warn(
        "⚠️ Skipping Google Send: Missing PDF Base64 or Script URL",
      );
    }

    const rowData = {
      "Date Received": new Date().toISOString(),
      Name: `${asString(quoteData.formData.firstName)} ${asString(quoteData.formData.lastName)}`.trim(),
      Company: asString(quoteData.formData.companyName),
      Email: asString(quoteData.formData.workEmail),
      Status: "Processed via Google Script",
    };

    console.log("📊 Request processed:", rowData);

    return c.json({
      success: true,
      message: "Quote processed successfully",
    });
  } catch (error) {
    return handleApiError(c, error, "Unknown submission error");
  }
});

// ============================================================================
// SERVER
// ============================================================================

Deno.serve(app.fetch);