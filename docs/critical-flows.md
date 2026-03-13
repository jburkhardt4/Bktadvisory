# Critical Flows

## 1. Document Upload Analysis
- User uploads one or more documents.
- Analyzer extracts text and pre-fills estimator state.
- Re-entering Step 3 after navigating back to Step 2 must not rerun analysis unless inputs changed.

## 2. Scope Autofill Integrity
- Goals, Problems, and Requirements must be formatted correctly:
  - bullets for multiple items
  - plain text for single items

## 3. Quote Generation
- Clicking "Download Quote" must:
  - generate the quote UI correctly
  - generate and download a PDF
  - preserve consistent quote totals and timelines

## 4. Downstream Lead Handling
- Generated quote data must be compatible with:
  - Google Sheet insertion
  - user email delivery
  - owner email delivery

## 5. Mobile Layout
- Quote container width must preserve margins.
- Payment sections must maintain intended mobile grid layout.
- Sticky headers must not obscure content.
