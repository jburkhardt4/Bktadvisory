import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import OpenAI from "npm:openai@4.73.0";

const app = new Hono();

app.use('*', logger(console.log));

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

app.post("/make-server-07a007e1/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { current_page, current_date, project_goals } = body;
    
    // Authorization: Use Deno.env.get for Supabase
    const apiKey = Deno.env.get("OPENAI_API_KEY"); 
    const openai = new OpenAI({ apiKey });

    // Build system prompt based on company guidelines
    const systemPrompt = `You are an AI model acting as a Customer Success Manager and AI Assistant for BKT Advisory, a technology consultancy led by John "JB" Burkhardt.

PRIMARY OBJECTIVES
1. When users express interest in meetings, consulting, or services, direct them to book a strategy call with John:
   https://calendar.google.com/calendar/appointments/AcZssZ2oJOt3ru0hrZTRKO0cjLT25Qv93G0QyQ4wSnE=?gv=true
2. Help users prepare a Structured Project Description for the Tech Project Estimator by gathering required information in a strict, deterministic order and outputting only the approved format.

Operate strictly within company scope. Follow the reasoning and data-gathering order exactly. Adhere to all output, pricing, and behavioral constraints.

---

COMPANY CONTEXT
- Founder: John "JB" Burkhardt — Salesforce & AI Systems Architect (5x Salesforce Certified)
- Focus: Salesforce CRM, AI systems, RevOps, FinTech, InsurTech, advanced sales automation
- Value: Shorten sales cycles, automate underwriting, operationalize AI on Salesforce

SESSION VARIABLES
- Current Page: ${current_page}
- Current Date: ${current_date}

---

ENTRY PROTOCOL (CRITICAL)
Before responding, determine whether the user has provided concrete project details (industry, CRM, pain points, goals).

If NO details are provided:
- Do NOT say "Thanks for the details so far."
- Confirm you can help (e.g., "Of course," "Certainly")
- Immediately ask concise, bulleted clarifying questions to begin data gathering.

---

SCHEDULING RULE (HIGHEST PRIORITY)
If the user requests or implies interest in meetings, consulting, or services:
Respond ONLY with:
"You can book a strategy call with John Burkhardt directly here: https://calendar.google.com/calendar/appointments/AcZssZ2oJOt3ru0hrZTRKO0cjLT25Qv93G0QyQ4wSnE=?gv=true"

---

PRICING & ESTIMATION RULES
- Never provide prices, costs, or dollar amounts.
- For any pricing or estimate request, respond EXACTLY with:
"Our Tech Project Estimator can give you a tailored range based on your specific requirements. Would you like me to help you draft a description to get the best result?"
- IMPORTANT: When referring to the estimator, ALWAYS use the full capitalized phrase "Tech Project Estimator" or "Project Estimator" so that the system can automatically link it to the tool.

---

TECH STACK OPTIONS (IMPORTANT - Use these exact options)
When parsing project descriptions for autofill, use ONLY these valid options:

CRM Platforms: Salesforce, Dynamics 365, GoHighLevel, HubSpot, Monday.com, Zoho
Salesforce Clouds: Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, Financial Services Cloud, Experience Cloud, Agentforce
Integrations: Slack, Asana, Jira, GitHub, Google Workspace, Microsoft 365, Zoom, DocuSign, Make.com, Zapier, n8n, MuleSoft
AI Tools: OpenAI ChatGPT, Gemini, Copilot, Claude
Service Modules: Reporting and Dashboards, Workflow Automation, Custom Development, Lead Management, Data Migration, User Training

---

DATA GATHERING LOGIC (STRICT ORDER)
Always collect information in this order:
1. Current systems/infrastructure
2. Pain points/challenges
3. Desired outcomes & measurable goals
4. Required automations/integrations
5. Key deliverables/requirements
6. Timeline & constraints (budget only if explicitly provided)

- Ask only concise, bulleted questions.
- No conversational filler.
- Do not generate conclusions, recommendations, or scope until all sections are addressed.

---

STRUCTURED PROJECT DESCRIPTION FORMAT (STRICT)
When generating a scope, output ONLY the following headers and bullet points.
No commentary. No extra formatting.
Use "[TBD]" where information is missing.

PROJECT SCOPE & OBJECTIVES
• Business goals and success metrics

CURRENT TECH STACK
• Existing CRMs, tools, integrations, data sources

PROBLEMS
• Manual processes, bottlenecks, risks, growth blockers

REQUIREMENTS
• Features, reports, roles, permissions, technical needs

AUTOMATIONS & INTEGRATIONS
• Workflows to automate, platforms to integrate


TIMELINE & CONSTRAINTS
• Target dates, deadlines, dependencies, constraints

Continue gathering missing data until all fields are complete.`;

    const userMessage = project_goals || "User needs assistance";

    console.log("Sending request to OpenAI Chat Completions API");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const outputText = completion.choices[0]?.message?.content || "";
    
    if (!outputText) {
      return c.json({ 
        error: "OpenAI returned empty response" 
      }, 500);
    }

    return c.json({ 
      content: outputText.trim(),
      isJson: outputText.includes("PROJECT SCOPE")
    });

  } catch (e) {
    console.error("Server Error:", e);
    // @ts-ignore: Error handling
    return c.json({ error: e.message || "Unknown server error" }, 500);
  }
});

app.post("/make-server-07a007e1/request-case-study", async (c) => {
  try {
    const body = await c.req.json();
    const { caseStudyLabel, caseStudySummary, sourceUrl, requestedAt } = body;

    if (!caseStudyLabel || !caseStudySummary || !sourceUrl || !requestedAt) {
      console.warn("request-case-study: missing required fields", {
        caseStudyLabel: !!caseStudyLabel,
        caseStudySummary: !!caseStudySummary,
        sourceUrl: !!sourceUrl,
        requestedAt: !!requestedAt,
      });
      return c.json({ error: "Missing required fields: caseStudyLabel, caseStudySummary, sourceUrl, requestedAt" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const toEmail = Deno.env.get("CASE_STUDY_TO_EMAIL");
    const ccEmail = Deno.env.get("CASE_STUDY_CC_EMAIL");

    if (!resendApiKey || !toEmail) {
      console.error("request-case-study: missing required environment variables (RESEND_API_KEY, CASE_STUDY_TO_EMAIL)");
      return c.json({ error: "Server configuration error" }, 500);
    }

    const subject = `Case Study Request: ${caseStudyLabel}`;
    const body_html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px;">
          Case Study Request — BKT Advisory
        </h2>
        <p>A visitor has requested the <strong>${caseStudyLabel}</strong> case study from the BKT Advisory website.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; width: 160px; border: 1px solid #e2e8f0;">Case Study</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${caseStudyLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; border: 1px solid #e2e8f0;">Summary</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${caseStudySummary}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; border: 1px solid #e2e8f0;">Source URL</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><a href="${sourceUrl}" style="color: #1d4ed8;">${sourceUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; border: 1px solid #e2e8f0;">Requested At</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${new Date(requestedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td>
          </tr>
        </table>
        <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
          This notification was sent automatically by the BKT Advisory website. Please follow up with the requester promptly.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">BKT Advisory — bktadvisory.com</p>
      </div>
    `;

    const emailPayload: Record<string, unknown> = {
      from: "BKT Advisory <noreply@bktadvisory.com>",
      to: [toEmail],
      subject,
      html: body_html,
    };

    if (ccEmail) {
      emailPayload.cc = [ccEmail];
    }

    console.log(`request-case-study: sending email for "${caseStudyLabel}" to ${toEmail}`);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("request-case-study: Resend API error", resendResponse.status, errorText);
      return c.json({ error: "Failed to send email notification" }, 500);
    }

    console.log(`request-case-study: email sent successfully for "${caseStudyLabel}"`);
    return c.json({
      success: true,
      message: `Your request for the "${caseStudyLabel}" case study has been received. We'll be in touch shortly.`,
    });
  } catch (e) {
    console.error("request-case-study: unexpected error", e);
    // @ts-ignore: Error handling
    return c.json({ error: e.message || "Unknown server error" }, 500);
  }
});

Deno.serve(app.fetch);