    import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import OpenAI from "npm:openai@4.86.0";

const app = new Hono();

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

app.post("/make-server-07a007e1/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { current_page, current_date, project_goals } = body;

    // Authorization: Use Deno.env.get for Supabase
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const openai = new OpenAI({ apiKey });

    console.log("Sending request to OpenAI Stored Prompt API");

    // Use Chat Completions fallback for the main chat as well,
    // since `openai.responses` is causing crashes.
    console.log(
      "Sending request to OpenAI Chat Completions (Fallback)",
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are the BKT Advisory AI Assistant for the Tech Project Estimator (Prompt Version 7).
          
          Context:
          - Page: ${current_page || "Unknown"}
          - Date: ${current_date || new Date().toISOString().split("T")[0]}
          
          User Goal/Input: "${project_goals || "User needs assistance"}"
          
          Instructions:
          - If the user provides project details, parse them and suggest a configuration.
          - If the user asks about services, provide a brief summary.
          - If the user expresses interest in booking, scheduling, or speaking with John, you must append the hidden tag ":::OPEN_BOOKING:::" to the end of your response.
          - Keep responses helpful, professional, and tech-forward.
          - If extracting scope, you can output JSON if explicitly asked.
          - Numeric Consistency: Always use digits (e.g., "2") instead of written-out numbers (e.g., "two").
          - Quote Sanitization: Do not include any quotation marks (single or double) in the output.

          STRUCTURED PROJECT DESCRIPTION FORMAT:
          - PROJECT SCOPE & OBJECTIVES
          - CURRENT TECH STACK
          - PROBLEMS
          - REQUIREMENTS
          - AUTOMATIONS & INTEGRATIONS
          - TIMELINE & CONSTRAINTS

          OUTPUT CONSTRAINTS:
          1. RESTRICTED PAGES: If 'Page' is "Scope" or "Contact Info", you must NOT output the STRUCTURED PROJECT DESCRIPTION FORMAT defined above.
             - If the user requests a full scope or project description on these pages, acknowledge their input and confirm you have noted the requirements, or ask clarifying questions. Tell them the full scope will be generated in a later step.
          2. ALLOWED PAGES: The STRUCTURED PROJECT DESCRIPTION FORMAT should ONLY be generated if 'Page' is "IT Infrastructure", "Services", or "Team & Extras".`,
        },
        {
          role: "user",
          content: project_goals || "Hello",
        },
      ],
    });

    const outputText =
      completion.choices[0].message.content || "";

    if (!outputText) {
      console.error("Empty response from OpenAI:", completion);
      return c.json(
        {
          error: "OpenAI returned empty response",
        },
        500,
      );
    }

    return c.json({
      content: outputText.trim(),
      isJson: outputText.includes("PROJECT SCOPE"),
    });
  } catch (e) {
    console.error("Server Error:", e);
    
    // Check for OpenAI Quota Error
    // @ts-ignore: Error type checking
    if (e?.status === 429 || e?.error?.code === 'insufficient_quota' || e?.message?.includes('quota')) {
      return c.json(
        { error: "quota_exceeded", message: "AI Usage Limit Reached" },
        429
      );
    }

    // @ts-ignore: Error handling
    return c.json(
      { error: e.message || "Unknown server error" },
      500,
    );
  }
});

app.post("/make-server-07a007e1/refine-scope", async (c) => {
  try {
    const body = await c.req.json();
    const { text, type } = body;
    // Authorization: Use Deno.env.get for Supabase
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const openai = new OpenAI({ apiKey });

    // Polyfill for OpenAI Responses API (Beta) if undefined in SDK
    // @ts-ignore: Polyfill for missing SDK method
    if (!openai.responses) {
      console.log(
        "Polyfilling openai.responses.create for Stored Prompts",
      );
      // @ts-ignore: Polyfill
      openai.responses = {
        create: async (params: any) => {
          // FALLBACK: Use Standard Chat Completions
          // The Stored Prompt API is unstable/undocumented in this environment.
          // We simulate the "Scope Refiner" behavior with a strong system prompt.

          const promptType =
            params.variables?.type || "General";
          const userText = params.variables?.text || "";

          console.log(
            `Using Polyfill Fallback for Prompt: ${params.prompt_id} (${promptType})`,
          );

          const completion =
            await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: `You are an elite Salesforce Consultant, Solution Architect and Business Analyst. Your task is to rewrite user-provided text for a Statement of Work according to the specified input type. 

OBJECTIVE:
You will receive two fields: "text" (the user's input) and "${promptType}" (one of: "Problem", "Requirement", "Goal", or "Synthesis"). 

CRITICAL OUTPUT RULES (STRICT ENFORCEMENT):
1. IF type is "Problem", "Requirement", or "Goal":
   - You must output ONLY the refined text for that specific section.
   - You must NOT use headers like "PROJECT SCOPE", "CURRENT TECH STACK", etc.
   - You must NOT output a full report. Just the single refined list or paragraph.
   - If there are multiple items references (i.e., multiple problems, requirements, or goals), refine each and list them as bullet points with ("• ")
   - CHARACTER LIMITS:
       • Goal: Max 500 characters.
       • Problem: Max 750 characters.
       • Requirement: Max 1,000 characters.
       
    Your output must consist solely of a polished, formal version as instructed below:
      • If ${promptType} is "Goal": Rewrite as a SMART business outcome.
      • If ${promptType} is "Problem": Rewrite as a formal Root Cause Analysis statement.
      • If ${promptType} is "Requirement": Rewrite as a strict Salesforce BABOK-compliant functional requirement, enforcing these Salesforce-aligned rules:
         - Convert inputs into validated, outcome-based functional requirements (not vague requests).
         - Express each requirement as a user story format (persona, action, value).
         - Add verification-ready criteria using measurable conditions (field values, triggers, time limits, record creation/updates, notifications).
         - Include data constraints when mentioned (objects, fields, validation rules, statuses, required data).
         - If the input is clearly non-functional (performance, security, scalability), preserve it as a non-functional requirement instead of forcing functional wording.
         - Keep language stakeholder-readable but precise enough for developers and QA to implement and test.
  
2. If type is "Synthesis" on step 3 or later: You will receive a combined block containing Problems, Requirements, Goals, and Technical Selections.
   - In a succinctly articulate manner, synthesize these into a structured Scope of Work in a bullet-point outline while using the EXACT headers below. Map the input data to the most relevant section:
      • PROJECT SCOPE & OBJECTIVES
      • CURRENT TECH STACK
      • PROBLEMS
      • REQUIREMENTS
      • AUTOMATIONS & INTEGRATIONS
      • TIMELINE & CONSTRAINTS
————

CONSTRAINTS:
 • Do not hallucinate information not present in the input.
 • RESTRICTED PAGES: If 'Page' is "Scope" or "Contact Info", you must NOT output the STRUCTURED PROJECT DESCRIPTION FORMAT defined above.
 • Output ONLY the polished version. No intro, no markdown, no conversational filler.
 • Do not include reasoning or labels in the final response.
 • Format: Use the headers provided (ALL CAPS). Use bullet points (•) for items.
 • Numeric Consistency: Always use digits (e.g., "2") instead of written-out numbers (e.g., "two").
 • Quote Sanitization: Do not include any quotation marks (single or double) in the output.
 • Missing Data: If a section has no relevant input, put "TBD" or "Not Specified".
————

EXAMPLES

**Example 1**

Input:
- text: "Our sales team is wasting too much time because they have to manually copy data from emails into Salesforce, and they keep making mistakes."
- type: Problem

Output:
Manual transcription of email data into Salesforce by the sales team is causing inefficiencies and frequent errors, resulting in lost productivity and compromised data integrity.
——

**Example 2**

Input:
- text: "We need the system to automatically email the customer a PDF receipt whenever they pay an invoice online."
- type: Requirement

Output:
The system automatically generates and deliver a PDF receipt via email to customers immediately after successful online invoice payments.
——

**Example 3**

Input:
- text: "We want to improve our customer service response times this year."
- type: Goal

Output:
Reduce average customer service response times by 30% by the end of the calendar year through process optimization and enhanced staffing, with performance monitored monthly against baseline metrics.
——

**Example 4 (Synthesis)**

Input: 
- text: "Problem: Manual data entry is slow. Requirement: Auto-sync leads to CRM. Goal: Save 20 hours a week. Tech: Salesforce, Slack."
- type: Synthesis

Output:
PROJECT SCOPE & OBJECTIVES
 • Achieve a reduction in administrative overhead by approximately 20 hours per week.
 • Accelerate the overall lead-to-conversion cycle.

CURRENT TECH STACK
 • CRM: Salesforce
 • Integrations: Slack, Google Workspace
 • AI: OpenAI ChatGPT, Gemini

PROBLEMS
 • Operational workflow hindered by manual data entry processes.
 • Significant delays and increased risk of administrative errors.

REQUIREMENTS
 • The system automatically syncs leads to the CRM in real-time.

AUTOMATIONS & INTEGRATIONS
 • Automated lead synchronization architecture between web front-end and CRM.

TIMELINE & CONSTRAINTS
 • Not Specified
——

(Reminder: For realistic examples, user-provided text may be longer and more detailed. Replace bracketed placeholders with relevant context as needed.)`,
                },
                {
                  role: "user",
                  content: userText,
                },
              ],
              temperature: 0.18,
              max_tokens: 1200
            });

          // Construct response to match expected structure
          return {
            choices: [
              {
                message: {
                  content:
                    completion.choices[0].message.content,
                },
              },
            ],
          };
        },
      };
    }

    console.log("Sending request to Scope Refiner (Version 12");
    // @ts-ignore: OpenAI Responses API usage
    const completion = await openai.responses.create({
      prompt_id:
        "pmpt_69901c4d671481949b01dcdcf78cc4d10aea3dd8dcce3dee",
      version: 12,
      variables: {
        text,
        type,
      },
    });
    // Extract output safely
    let outputText =
      completion.choices[0]?.message?.content || "";
    if (!outputText) {
      return c.json(
        { error: "OpenAI returned empty response" },
        500,
      );
    }

    // Apply strict character limits based on type
    let limit = 0;
    if (type === 'Goal') limit = 500;
    else if (type === 'Problem') limit = 750;
    else if (type === 'Requirement') limit = 1000;

    if (limit > 0 && outputText.length > limit) {
      // Truncate at the last complete sentence within the limit
      const truncated = outputText.substring(0, limit);
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > 0) {
        outputText = truncated.substring(0, lastPeriod + 1);
      } else {
        // Fallback if no period found
        outputText = truncated;
      }
    }

    // Return standard JSON
    return c.json({
      content: outputText.trim(),
    });
  } catch (e) {
    console.error("Server Error:", e);
    
    // Check for OpenAI Quota Error
    // @ts-ignore: Error type checking
    if (e?.status === 429 || e?.error?.code === 'insufficient_quota' || e?.message?.includes('quota')) {
      return c.json(
        { error: "quota_exceeded", message: "AI Usage Limit Reached" },
        429
      );
    }

    // @ts-ignore: Error handling
    return c.json(
      { error: e.message || "Unknown server error" },
      500,
    );
  }
});

app.post("/make-server-07a007e1/analyze-document", async (c) => {
  try {
    const body = await c.req.json();
    const { text, fileName } = body; // Expecting text content for now (client-side extraction)
    
    // Authorization
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const openai = new OpenAI({ apiKey });

    console.log(`Analyzing document: ${fileName}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Solutions Architect. Analyze the provided Project Specification / RFP text and extract structured data into a strictly valid JSON object.
          
          OUTPUT FORMAT (JSON ONLY):
          {
            "projectDescription": "Concise executive summary of the project (max 150 words)",
            "problems": "Bulleted list of current pain points and challenges. Format as a vertical bulleted list. You must strictly insert a newline character (\\n) before every bullet point so that each item appears on its own distinct line. Do not output a single continuous paragraph.",
            "requirements": "Bulleted list of functional and technical requirements. Format as a vertical bulleted list. You must strictly insert a newline character (\\n) before every bullet point so that each item appears on its own distinct line. Do not output a single continuous paragraph.",
            "goals": "Bulleted list of business objectives and success metrics. Format as a vertical bulleted list. You must strictly insert a newline character (\\n) before every bullet point so that each item appears on its own distinct line. Do not output a single continuous paragraph.",
            "suggestedInfrastructure": ["Salesforce", "AWS", "Azure", "SharePoint", "Slack", ...],
            "suggestedServices": ["Implementation", "Custom Development", "Data Migration", "Training", ...]
          }
          
          CONSTRAINTS:
          - suggestedInfrastructure should match common tech stacks (CRM, Cloud, Integrations).
          - suggestedServices should match professional services categories.
          - If information is missing, infer reasonable defaults based on context or leave empty.
          - Do not include markdown formatting like \`\`\`json. Just return the raw JSON object.
          - For 'problems', 'requirements', and 'goals': Ensure strictly consistent formatting. Every item must start with '• '. No dashes or asterisks.`
        },
        {
          role: "user",
          content: `Document Content:\n\n${text.substring(0, 15000)}` // Truncate to avoid token limits if massive
        }
      ],
      response_format: { type: "json_object" }
    });

    const output = completion.choices[0].message.content;
    const json = JSON.parse(output || "{}");

    return c.json(json);

  } catch (e) {
    console.error("Analysis Error:", e);
    
    // Check for OpenAI Quota Error
    // @ts-ignore: Error type checking
    if (e?.status === 429 || e?.error?.code === 'insufficient_quota' || e?.message?.includes('quota')) {
      return c.json(
        { error: "quota_exceeded", message: "AI Usage Limit Reached" },
        429
      );
    }

    // @ts-ignore: Error handling
    return c.json({ error: e.message || "Analysis failed" }, 500);
  }
});

app.post("/make-server-07a007e1/generate-value-prop", async (c) => {
  try {
    const body = await c.req.json();
    const { problems, goals, infrastructure, services } = body;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Strategic Consultant. Based on the client's problems and the tech stack we are proposing, write a compelling, specific 1-sentence value proposition (max 35 words) for the final quote header. Focus on the outcome.

          Context:
          - Problems: ${problems || 'Not specified'}
          - Proposed Infrastructure: ${infrastructure || 'Not specified'}
          - Goals: ${goals || 'Not specified'}
          - Services: ${services || 'Not specified'}

          Output strictly valid JSON in the following format:
          { "valueStatement": "Your value proposition here." }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const output = completion.choices[0].message.content;
    const json = JSON.parse(output || "{}");

    return c.json(json);

  } catch (e) {
    console.error("Value Prop Generation Error:", e);
    
    // Check for OpenAI Quota Error
    // @ts-ignore: Error type checking
    if (e?.status === 429 || e?.error?.code === 'insufficient_quota' || e?.message?.includes('quota')) {
       return c.json(
        { error: "quota_exceeded", message: "AI Usage Limit Reached" },
        429
      );
    }

    // @ts-ignore: Error handling
    return c.json({ error: e.message || "Failed to generate value prop" }, 500);
  }
});

app.post("/make-server-07a007e1/submit-quote", async (c) => {
  try {
    const quoteData = await c.req.json();

    // 1. Generate Date String (MM.DD.YYYY)
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${mm}.${dd}.${yyyy}`;

    // 2. Determine Entity Name
    let entityName = "Client";
    if (quoteData.formData.companyName && quoteData.formData.companyName.trim()) {
      entityName = quoteData.formData.companyName.trim();
    } else if (quoteData.formData.firstName || quoteData.formData.lastName) {
      entityName = `${quoteData.formData.firstName || ""} ${quoteData.formData.lastName || ""}`.trim();
    }

    // 3. Sanitize Entity Name (Replace slashes and special chars with dashes)
    const sanitizedEntityName = entityName.replace(/[\/\\?%*:|"<>]/g, "-").trim();

    // 4. Construct Filename
    const fileName = `BKT_Quote - ${sanitizedEntityName} - ${dateStr}.pdf`;

    // --- GOOGLE APPS SCRIPT CONNECTION ---
    // This sends the data to your Google Sheet & Drive
    const googlePayload = {
      formData: {
        date: new Date().toISOString(),
        website: quoteData.formData.website,
        companyName: quoteData.formData.companyName, // Explicitly added Company Name
        firstName: quoteData.formData.firstName,
        lastName: quoteData.formData.lastName,
        workEmail: quoteData.formData.workEmail,
        mobilePhone: quoteData.formData.mobilePhone,
        estimatedWeeks: quoteData.estimatedWeeks,
        hoursPerWeek: quoteData.hoursPerWeek || 25,
        adjustedHours: quoteData.adjustedHours,
        finalHourlyRate: quoteData.finalHourlyRate,
        totalCost: quoteData.totalCost,
        projectOverview:
          quoteData.formData.projectDescription ||
          quoteData.formData.projectOverview,
      },
      fileData: {
        // IMPORTANT: Your frontend must include 'pdfBase64' in the request body for this to work
        name: fileName,
        base64: quoteData.pdfBase64 || "",
      },
    };

    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbyUYuS-Bq_AjA_zw6aqHSyLdNzbQifN7McyV6_RF0dtLhvk7b1fntqOWjaqH1nrZI1_/exec";

    // Only send if we have a URL and the PDF data
    if (
      quoteData.pdfBase64 &&
      GOOGLE_SCRIPT_URL.includes("script.google.com")
    ) {
      console.log(`📤 Sending data to Google Script...`);

      // Clean the Base64 string (remove data:application/pdf;base64, prefix if present)
      // Google Apps Script Utilities.base64Decode often fails with the prefix
      let cleanBase64 = quoteData.pdfBase64;
      if (cleanBase64.includes("base64,")) {
        cleanBase64 = cleanBase64.split("base64,")[1];
      }

      // Update payload with clean base64
      const cleanPayload = {
        ...googlePayload,
        fileData: {
          ...googlePayload.fileData,
          base64: cleanBase64,
        },
      };

      const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(cleanPayload),
      });

      if (!googleResponse.ok) {
        const errorText = await googleResponse.text();
        console.error(
          `❌ Google Script Failed: ${googleResponse.status} ${googleResponse.statusText}`,
        );
        console.error(`Response body: ${errorText}`);
      } else {
        const responseText = await googleResponse.text();
        console.log(
          `✅ Google Script Success: ${responseText}`,
        );
      }
    } else {
      console.warn(
        "⚠️ Skipping Google Send: Missing PDF Base64 or Script URL",
      );
    }
    // -------------------------------------

    // Logging for debugging (optional, kept from your original code)
    const rowData = {
      "Date Received": new Date().toISOString(),
      Name: `${quoteData.formData.firstName} ${quoteData.formData.lastName}`,
      Company: quoteData.formData.companyName,
      Email: quoteData.formData.workEmail,
      Status: "Processed via Google Script",
    };
    console.log(`📊 Request processed:`, rowData);

    return c.json({
      success: true,
      message: "Quote processed successfully",
    });
  } catch (e) {
    console.error("Submission Error:", e);
    // @ts-ignore: Error handling
    return c.json(
      { error: e.message || "Unknown submission error" },
      500,
    );
  }
});

Deno.serve(app.fetch);