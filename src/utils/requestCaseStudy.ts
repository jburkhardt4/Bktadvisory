import { projectId, publicAnonKey } from './supabase/info';

export interface CaseStudyRequest {
  caseStudyLabel: string;
  caseStudySummary: string;
  sourceUrl: string;
  requestedAt: string;
}

export async function requestCaseStudy(
  payload: CaseStudyRequest
): Promise<{ success: boolean; message: string }> {
  const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-07a007e1/request-case-study`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    throw new Error('Network error — please check your connection and try again.');
  }

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to submit case study request');
  }

  return { success: true, message: data.message || 'Request sent successfully.' };
}
