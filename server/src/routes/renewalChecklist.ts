import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

export const renewalChecklistRouter = Router();

const checklistSchema = z.object({
  category: z.enum([
    'Identity', 'Education', 'Finance', 'Vehicle', 'Medical', 'Employment', 'Other'
  ]),
  documentType: z.string().min(2, 'Document type is required').max(100),
  countryRegion: z.string().min(2, 'Country/region is required').max(100),
});

const DEMO_CHECKLIST = {
  explanation: 'This is a demo checklist (Gemini API key not configured). Configure GEMINI_API_KEY in server/.env to enable AI-powered checklists.',
  steps: [
    'Locate your current document and note its expiry date.',
    'Check the issuing authority\'s official website for current renewal requirements.',
    'Gather proof of identity (passport, national ID, or birth certificate).',
    'Collect any required supporting documents specific to your document type.',
    'Prepare a recent passport-sized photograph if required.',
    'Fill out the renewal application form accurately.',
    'Pay the applicable renewal fee.',
    'Submit your application in person, by mail, or online as appropriate.',
    'Retain the receipt or tracking number for follow-up.',
  ],
  commonDocuments: [
    'Valid government-issued photo ID',
    'Proof of address (utility bill, bank statement)',
    'Existing document being renewed',
    'Completed application form',
    'Payment (check, card, or money order)',
  ],
  timing: 'Begin the renewal process at least 3–6 months before expiry to avoid delays.',
  officialLinks: [],
  disclaimer: '⚠️ This is a general demo checklist. Requirements vary significantly by location and document type. Always verify current requirements with the relevant authority.',
  isDemo: true,
};

renewalChecklistRouter.post('/', async (req: Request, res: Response) => {
  const parsed = checklistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const { category, documentType, countryRegion } = parsed.data;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    res.json({ data: DEMO_CHECKLIST });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const prompt = `You are a helpful document management assistant. A user needs guidance on renewing their document.

Document Details:
- Category: ${category}
- Document Type: ${documentType}
- Country/Region: ${countryRegion}

Please provide a structured renewal preparation guide with the following sections. Be accurate, conservative, and helpful. Do NOT invent official URLs, fees, or legal requirements you are unsure about.

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "explanation": "A brief 2-3 sentence overview of what to check before renewal",
  "steps": ["step1", "step2", "..."],
  "commonDocuments": ["doc1", "doc2", "..."],
  "timing": "Recommended preparation timing as a single string",
  "officialLinks": [{"label": "link text", "url": "https://..."}],
  "disclaimer": "A disclaimer that requirements vary and user must verify with relevant authority"
}

For officialLinks: only include links you are highly confident are genuine official government/authority websites. If uncertain, return an empty array.
Include 5-8 steps, 4-6 common documents. Keep all text concise and practical.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text?.trim() || '';

    // Strip any markdown code fences if present
    const jsonText = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

    let checklist;
    try {
      checklist = JSON.parse(jsonText);
    } catch {
      // If JSON parsing fails, return a structured error
      res.status(502).json({
        error: 'AI returned an unexpected response format. Please try again.',
      });
      return;
    }

    res.json({ data: { ...checklist, isDemo: false } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /renewal-checklist] Gemini error:', message);

    // Return demo checklist on API failure
    res.json({
      data: {
        ...DEMO_CHECKLIST,
        disclaimer: `⚠️ AI service temporarily unavailable. Showing a general demo checklist. ${DEMO_CHECKLIST.disclaimer}`,
      },
    });
  }
});
