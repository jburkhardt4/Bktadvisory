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

app.post("/make-server-defb8dbd/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { current_page, current_date, project_goals } = body;
    
    // Authorization: Use Deno.env.get for Supabase
    const apiKey = Deno.env.get("OPENAI_API_KEY"); 
    const openai = new OpenAI({ apiKey });

    let outputText = "";
    let rawResponse = null;

    // Helper to extract text according to OpenAI Responses API documentation
    // Ref: https://platform.openai.com/docs/api-reference/responses/create
    const extractTextFromResponse = (response: any) => {
        if (!response || !response.output || !Array.isArray(response.output)) {
            return "";
        }

        let text = "";
        // filter for items where type is 'message'
        const messages = response.output.filter((item: any) => item.type === 'message');

        for (const msg of messages) {
            if (Array.isArray(msg.content)) {
                for (const part of msg.content) {
                    // Documentation specifies 'output_text', but we also check 'text' as safety
                    if ((part.type === 'output_text' || part.type === 'text') && part.text) {
                        text += part.text;
                    }
                }
            }
        }
        return text;
    };

    try {
        if (openai.responses && typeof openai.responses.create === 'function') {
            console.log("Using OpenAI SDK (responses.create)");
            // @ts-ignore: Dynamic call for beta API
            const response = await openai.responses.create({
                prompt: {
                    "id": "pmpt_69472c64fc748190abd8aaebb32c529902cb4874a9041596",
                    "version": "2",
                    "variables": {
                        "current_page": current_page || "Unknown",
                        "current_date": current_date || new Date().toISOString(),
                        "project_goals": project_goals || "User asking for help"
                    }
                }
            });
            rawResponse = response;
            outputText = extractTextFromResponse(response);
        } else {
            throw new Error("SDK does not support responses.create");
        }
    } catch (sdkError) {
        console.log("Falling back to raw fetch due to:", sdkError);
        
        const raw = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: {
                    "id": "pmpt_69472c64fc748190abd8aaebb32c529902cb4874a9041596",
                    "version": "2",
                    "variables": {
                        "current_page": current_page,
                        "current_date": current_date,
                        "project_goals": project_goals
                    }
                }
            })
        });

        const data = await raw.json();
        rawResponse = data;
        
        if (data.error) {
            return c.json({ error: data.error.message }, 500);
        }
        
        outputText = extractTextFromResponse(data);
    }

    // Final check: if outputText is still empty, try legacy extraction or report detailed structure
    if (!outputText) {
        // One final fallback attempt for any nested structures seen in previous errors
        if (rawResponse?.response?.output) {
             outputText = extractTextFromResponse(rawResponse.response);
        }
    }

    if (!outputText) {
        const debugStr = rawResponse ? JSON.stringify(rawResponse, null, 2) : "No response";
        return c.json({ 
            error: "OpenAI returned empty text. Full Response: " + debugStr.substring(0, 5000) 
        }, 500);
    }

    return c.json({ 
        content: outputText.trim(),
        isJson: outputText.includes("**PROJECT SCOPE")
    });

  } catch (e) {
    console.error("Server Error:", e);
    // @ts-ignore: Error handling
    return c.json({ error: e.message }, 500);
  }
});

Deno.serve(app.fetch);