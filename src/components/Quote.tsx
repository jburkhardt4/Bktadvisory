import {
  Document as DocxDocument, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType,
  convertInchesToTwip
} from 'docx';
import { useRef, useState, useEffect } from 'react';
import { QuoteData, PersonaMode } from '../types';
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import profileImage from "figma:asset/9cffe000c5dffcabac269f49ac3d9d3bd3026163.png";
import logoImage from "figma:asset/0e0a121653cc931918711be760206409b22eeac2.png";
import signatureImage from "figma:asset/c9b7fbd7a0a9b7fe816298e590cdf7f50d449a06.png";

// Icon components to avoid lucide-react import issue
const ArrowLeftIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const StarIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const PrinterIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const FileIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const CheckIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Filter to skip cross-origin stylesheets that html-to-image cannot read
// IMPORTANT: Allow Google Fonts through (they support CORS), only block others (e.g. Google Calendar)
const toPngFilter = (node: any) => {
  if (node?.tagName === 'LINK' && node?.getAttribute?.('rel') === 'stylesheet') {
    const href = node.getAttribute('href') || '';
    if (
      href.startsWith('http') &&
      !href.includes(window.location.hostname) &&
      !href.includes('fonts.googleapis.com') &&
      !href.includes('fonts.gstatic.com')
    ) return false;
  }
  // Block <style> elements that reference external URLs (e.g., Figma S3)
  if (node?.tagName === 'STYLE') {
    const content = node.textContent || '';
    if (content.includes('s3-figma-foundry') || content.includes('figma.com')) {
      return false;
    }
  }
  return true;
};

interface QuoteProps {
  data: QuoteData;
  onBack: () => void;
  personaMode?: PersonaMode | null;
}

export function Quote({ data, onBack, personaMode }: QuoteProps) {
  const quoteRef = useRef<HTMLDivElement>(null);
  const pdfCaptureRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'scope'>('summary');

  // ── Mobile detection (matches md: breakpoint at 768px) ──
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const hasFiles = data.formData.uploadedFiles && data.formData.uploadedFiles.length > 0;
  
  // Check if scope exists (at least one field is populated)
  const hasScope = !!(
    data.formData.scopeProblems || 
    data.formData.scopeRequirements || 
    data.formData.scopeGoals
  );

  // Persona-driven section titles
  const summaryTitle = personaMode === 'lite'
    ? 'Quick Estimate'
    : personaMode === 'enterprise'
      ? 'Enterprise Proposal'
      : 'Professional Services Quote';

  const scopeTitle = personaMode === 'lite'
    ? 'Scope Summary'
    : personaMode === 'enterprise'
      ? 'Enterprise Scope of Work'
      : 'Detailed Scope of Work';

  const renderList = (text: string) => {
    // Split by newline or bullet point, strip leading bullets, and filter empty items
    const items = text.split(/[\n•]/).filter(item => item.trim().length > 0);
    
    if (items.length === 0) return null;

    return (
      <ul className="list-disc list-outside ml-4 space-y-2 marker:text-xs marker:text-slate-700">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-slate-700 leading-snug">
            {item.replace(/^•\s*/, '').trim()}
          </li>
        ))}
      </ul>
    );
  };

  const getQuoteFilename = () => {
    const { formData } = data;
    let entityName = "Client";
    
    // Priority 1: Company Name
    if (formData.companyName && formData.companyName.trim()) {
      entityName = formData.companyName.trim();
    } 
    // Priority 2: First Name + Last Name
    else if (formData.firstName || formData.lastName) {
      entityName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
    }

    // Sanitize: Replace invalid filename characters with dashes
    const sanitizedEntityName = entityName.replace(/[\/\\?%*:|"<>]/g, "-").trim();
    
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const dateStr = `${mm}.${dd}.${yyyy}`;

    return `BKT_Quote - ${sanitizedEntityName} - ${dateStr}.pdf`;
  };

  const getQuoteBasename = () => {
    const { formData } = data;
    let entityName = "Client";
    if (formData.companyName && formData.companyName.trim()) {
      entityName = formData.companyName.trim();
    } else if (formData.firstName || formData.lastName) {
      entityName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
    }
    const sanitizedEntityName = entityName.replace(/[\/\\?%*:|"<>]/g, "-").trim();
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const dateStr = `${mm}.${dd}.${yyyy}`;
    return `BKT_Quote - ${sanitizedEntityName} - ${dateStr}`;
  };

  // --- Google Doc (.docx) Generation — faithfully replicates HTML/CSS layout ---
  const generateQuoteDocx = async () => {
    const fd = data.formData;

    // ── Tailwind color map (exact hex values) ──
    const blue700 = "1D4ED8";
    const blue600 = "2563EB";
    const blue100 = "DBEAFE";
    const blue50  = "EFF6FF";
    const slate900 = "0F172A";
    const slate700 = "334155";
    const slate600 = "475569";
    const slate500 = "64748B";
    const slate400 = "94A3B8";
    const slate200 = "E2E8F0";
    const slate100 = "F1F5F9";
    const slate50  = "F8FAFC";
    const green600 = "16A34A";
    const green100 = "DCFCE7";
    const red600   = "DC2626";
    const red100   = "FEE2E2";
    const yellow400 = "FACC15";
    const white    = "FFFFFF";

    // ── Size helpers (half-points: text-3xl=30px→60, text-2xl=24px→48, etc.) ──
    const sz = { '3xl': 60, '2xl': 48, xl: 40, lg: 36, base: 32, sm: 28, xs: 24, tiny: 20 };

    const today = new Date().toLocaleDateString();

    // ── Reusable border presets ──
    const noBorder = { style: BorderStyle.NONE, size: 0, color: white };
    const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
    const thinBottomSlate = { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 1, color: slate100 } };

    const parseBullets = (text: string) =>
      text.split(/[\n•]/).filter(item => item.trim().length > 0).map(item => item.trim());
    const spacer = (pts = 120) => new Paragraph({ spacing: { after: pts }, children: [] });

    // ═══════════════════════════════════════════════════════════
    // PAGE 1: ESTIMATE SUMMARY
    // ═══════════════════════════════════════════════════════════
    const page1: any[] = [];

    // ── Document Header (flex row + border-b-4 border-blue-700) ──
    page1.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 8, color: blue700 } },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorders,
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ spacing: { after: 40 }, children: [
                    new TextRun({ text: "BKT Advisory", size: sz['3xl'], bold: true, color: blue700, font: "Calibri" }),
                  ]}),
                  new Paragraph({ spacing: { after: 30 }, children: [
                    new TextRun({ text: "Salesforce & AI Systems Consulting", size: sz.base, color: slate600, font: "Calibri" }),
                  ]}),
                  new Paragraph({ spacing: { after: 120 }, children: [
                    new TextRun({ text: "★★★★★", size: sz.xs, color: yellow400, font: "Calibri" }),
                    new TextRun({ text: "  Top Rated on Upwork", size: sz.xs, color: slate500, font: "Calibri" }),
                  ]}),
                ],
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 20 }, children: [
                    new TextRun({ text: "John Burkhardt", size: sz.sm, bold: true, color: slate900, font: "Calibri" }),
                  ]}),
                  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 120 }, children: [
                    new TextRun({ text: "Principal Consultant", size: sz.xs, color: slate600, font: "Calibri" }),
                  ]}),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // ── Title ──
    page1.push(
      new Paragraph({
        spacing: { before: 200, after: 240 },
        children: [new TextRun({ text: "Professional Services Quote", size: sz['2xl'], bold: true, color: slate900, font: "Calibri" })],
      })
    );

    // ── Value Statement (border-l-4 blue-700, bg blue-50) ──
    page1.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: blue50 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: blue50 },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: blue50 },
              right: { style: BorderStyle.SINGLE, size: 1, color: blue50 },
              left: { style: BorderStyle.SINGLE, size: 8, color: blue700 },
            },
            margins: { top: convertInchesToTwip(0.12), bottom: convertInchesToTwip(0.12), left: convertInchesToTwip(0.18), right: convertInchesToTwip(0.18) },
            children: [
              new Paragraph({ spacing: { after: 60 }, children: [
                new TextRun({ text: "Project Value Statement", size: sz.sm, bold: true, color: blue700, font: "Calibri" }),
              ]}),
              new Paragraph({ children: [
                new TextRun({
                  text: fd.valueStatement || "This customized solution will streamline your operations, increase efficiency, and provide a predictable growth engine for your organization through strategic CRM architecture and AI-powered automation.",
                  size: sz.sm, color: slate700, font: "Calibri", italics: true,
                }),
              ]}),
            ],
          }),
        ]})],
      }),
      spacer(200)
    );

    // ── Build Project Overview content (left cell) ──
    const overviewParas: Paragraph[] = [];
    overviewParas.push(new Paragraph({ spacing: { after: 100 }, children: [
      new TextRun({ text: "Project Overview", size: sz.sm + 2, bold: true, color: slate900, font: "Calibri" }),
    ]}));

    const addField = (label: string, value: string) => {
      overviewParas.push(new Paragraph({ spacing: { after: 50 }, children: [
        new TextRun({ text: `${label}: `, size: sz.sm, color: slate600, font: "Calibri" }),
        new TextRun({ text: value, size: sz.sm, font: "Calibri" }),
      ]}));
    };

    if (fd.companyName) { addField("Prepared for", fd.companyName); addField("Client", `${fd.firstName} ${fd.lastName}`); }
    else { addField("Prepared for", `${fd.firstName} ${fd.lastName}`); }
    if (fd.website) addField("Website", fd.website);
    if (fd.selectedCRMs.length > 0) addField("CRM Platforms", fd.selectedCRMs.join(", "));
    if (fd.selectedClouds.length > 0) addField("Salesforce Clouds", fd.selectedClouds.join(", "));
    if (fd.selectedIntegrations.length > 0) addField("Integrations", fd.selectedIntegrations.join(", "));
    if (fd.selectedAITools.length > 0) addField("AI Tools", fd.selectedAITools.join(", "));
    if (fd.additionalModules.length > 0) {
      if (fd.additionalModules.length <= 2) {
        addField("Services", fd.additionalModules.join(", "));
      } else {
        overviewParas.push(new Paragraph({ spacing: { after: 30 }, children: [
          new TextRun({ text: "Services:", size: sz.sm, color: slate600, font: "Calibri" }),
        ]}));
        fd.additionalModules.forEach(mod => {
          overviewParas.push(new Paragraph({
            spacing: { after: 20 }, indent: { left: convertInchesToTwip(0.25) }, bullet: { level: 0 },
            children: [new TextRun({ text: mod, size: sz.sm, color: slate900, font: "Calibri" })],
          }));
        });
      }
    }
    addField("Delivery Team", `${fd.deliveryTeam.charAt(0).toUpperCase() + fd.deliveryTeam.slice(1)} (USA/SA/Europe)`);
    if (fd.powerUps.length > 0) addField("Selected Power-Ups", fd.powerUps.join(", "));

    overviewParas.push(new Paragraph({
      spacing: { before: 120, after: 40 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: slate200 } },
      children: [
        new TextRun({ text: "Estimated Timeline: ", size: sz.sm, bold: true, color: slate700, font: "Calibri" }),
        new TextRun({ text: `${data.estimatedWeeks} weeks`, size: sz.sm, font: "Calibri" }),
        new TextRun({ text: " (assuming 25 hours per week)", size: sz.sm, color: slate600, font: "Calibri" }),
      ],
    }));

    // ── Build Cost Breakdown content (right cell) ──
    const costParas: any[] = [];
    costParas.push(new Paragraph({ spacing: { after: 120 }, children: [
      new TextRun({ text: "Detailed Cost Breakdown", size: sz.sm + 2, bold: true, color: slate900, font: "Calibri" }),
    ]}));

    const costLineRows: TableRow[] = [];
    const addCostLine = (label: string, value: string, opts: { bold?: boolean; color?: string } = {}) => {
      costLineRows.push(new TableRow({ children: [
        new TableCell({
          borders: thinBottomSlate, width: { size: 60, type: WidthType.PERCENTAGE },
          margins: { top: 40, bottom: 40, left: 0, right: 0 },
          children: [new Paragraph({ children: [new TextRun({ text: label, size: sz.sm, color: opts.color || slate600, font: "Calibri" })] })],
        }),
        new TableCell({
          borders: thinBottomSlate, width: { size: 40, type: WidthType.PERCENTAGE },
          margins: { top: 40, bottom: 40, left: 0, right: 0 },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: value, size: sz.sm, font: "Calibri", bold: opts.bold, color: opts.bold ? slate900 : undefined })] })],
        }),
      ]}));
    };

    if (hoursMatch) { addCostLine("Total Hours", `${data.baseHours} hrs`, { bold: true }); }
    else { addCostLine("Base Project Hours", `${data.baseHours} hrs`); addCostLine("Adjusted Hours", `${data.adjustedHours} hrs`, { bold: true }); }
    addCostLine("Admin Rate (40%)", `$${data.adminRate}/hr`);
    addCostLine("Developer Rate (60%)", `$${data.developerRate}/hr`);
    if (data.powerUpRate > 0) addCostLine("+ Power-Ups", `+$${data.powerUpRate}/hr`, { color: blue700 });
    addCostLine("Final Hourly Rate", `$${data.finalHourlyRate}/hr`);

    costParas.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: costLineRows }));
    costParas.push(
      new Paragraph({ spacing: { before: 160 }, alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: "TOTAL PROJECT COST", size: sz.xs, color: slate500, font: "Calibri" }),
      ]}),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 60 }, children: [
        new TextRun({ text: `$${data.totalCost.toLocaleString()}`, size: sz['2xl'], bold: true, color: blue700, font: "Calibri" }),
        ...(hasFiles ? [new TextRun({ text: " *", size: sz.lg, bold: true, color: blue700, font: "Calibri" })] : []),
      ]})
    );

    // ── Compose 60/40 two-column layout table ──
    page1.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({
            borders: noBorders, width: { size: 58, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: slate50 },
            margins: { top: convertInchesToTwip(0.15), bottom: convertInchesToTwip(0.15), left: convertInchesToTwip(0.18), right: convertInchesToTwip(0.18) },
            children: overviewParas,
          }),
          new TableCell({ borders: noBorders, width: { size: 2, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: blue700 },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: blue700 },
              left: { style: BorderStyle.SINGLE, size: 4, color: blue700 },
              right: { style: BorderStyle.SINGLE, size: 4, color: blue700 },
            },
            margins: { top: convertInchesToTwip(0.15), bottom: convertInchesToTwip(0.15), left: convertInchesToTwip(0.18), right: convertInchesToTwip(0.18) },
            children: costParas,
          }),
        ]})],
      }),
      spacer(160)
    );

    // ── Files Received (conditional, bg-slate-50 with border) ──
    if (hasFiles) {
      page1.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: [
            new TableCell({
              shading: { type: ShadingType.SOLID, fill: slate50 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: slate200 },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: slate200 },
                left: { style: BorderStyle.SINGLE, size: 1, color: slate200 },
                right: { style: BorderStyle.SINGLE, size: 1, color: slate200 },
              },
              margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
              children: [
                new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "FILES RECEIVED", size: sz.xs, bold: true, color: slate500, font: "Calibri" })] }),
                ...fd.uploadedFiles.map(file =>
                  new Paragraph({ spacing: { after: 30 }, children: [
                    new TextRun({ text: "  ✓  ", size: sz.xs, color: green600, font: "Calibri" }),
                    new TextRun({ text: file.name, size: sz.xs, color: slate700, font: "Calibri" }),
                  ]})
                ),
              ],
            }),
          ]})],
        }),
        spacer(160)
      );
    }

    // ── Billing Terms (side-by-side cards with gutter) ──
    page1.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, fill: slate50 },
            borders: { top: { style: BorderStyle.SINGLE, size: 1, color: slate100 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: slate100 }, left: { style: BorderStyle.SINGLE, size: 1, color: slate100 }, right: { style: BorderStyle.SINGLE, size: 1, color: slate100 } },
            width: { size: 48, type: WidthType.PERCENTAGE },
            margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: "Upfront (50%)", size: sz.xs, color: slate500, font: "Calibri" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: `$${upfrontPayment.toLocaleString()}`, size: sz.lg, bold: true, color: blue700, font: "Calibri" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Due at start", size: sz.tiny, color: slate400, font: "Calibri" })] }),
            ],
          }),
          new TableCell({ borders: noBorders, width: { size: 4, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
          new TableCell({
            shading: { type: ShadingType.SOLID, fill: slate50 },
            borders: { top: { style: BorderStyle.SINGLE, size: 1, color: slate100 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: slate100 }, left: { style: BorderStyle.SINGLE, size: 1, color: slate100 }, right: { style: BorderStyle.SINGLE, size: 1, color: slate100 } },
            width: { size: 48, type: WidthType.PERCENTAGE },
            margins: { top: convertInchesToTwip(0.1), bottom: convertInchesToTwip(0.1), left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: "Midpoint (50%)", size: sz.xs, color: slate500, font: "Calibri" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [new TextRun({ text: `$${midpointPayment.toLocaleString()}`, size: sz.lg, bold: true, color: blue700, font: "Calibri" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Due at milestone", size: sz.tiny, color: slate400, font: "Calibri" })] }),
            ],
          }),
        ]})],
      }),
      new Paragraph({
        spacing: { before: 60, after: 120 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "*Payment terms subject to final agreement.", size: sz.tiny, color: slate500, font: "Calibri", italics: true })],
      })
    );

    // ═══════════════════════════════════════════════════════════
    // PAGE 2: DETAILED SCOPE (conditional)
    // ═══════════════════════════════════════════════════════════
    const scopeContent: any[] | null = hasScope ? [] : null;

    if (scopeContent) {
      scopeContent.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 8, color: blue700 } },
          rows: [new TableRow({ children: [
            new TableCell({ borders: noBorders, children: [
              new Paragraph({ spacing: { after: 120 }, children: [
                new TextRun({ text: "BKT Advisory", size: sz['2xl'], bold: true, color: blue700, font: "Calibri" }),
              ]}),
            ]}),
          ]})],
        }),
        new Paragraph({ spacing: { before: 200, after: 200 }, children: [
          new TextRun({ text: "Detailed Scope of Work", size: sz['2xl'], bold: true, color: slate900, font: "Calibri" }),
        ]}),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun({
            text: "The following sections outline the specific problems, requirements, and goals for this engagement based on our initial discovery.",
            size: sz.sm, color: slate700, font: "Calibri", italics: true,
          }),
        ]})
      );

      const addScope = (num: string, title: string, content: string, badgeColor: string, badgeBg: string) => {
        scopeContent!.push(
          new Paragraph({
            spacing: { before: 240, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: slate200 } },
            children: [
              new TextRun({ text: ` ${num} `, size: sz.sm, bold: true, color: badgeColor, font: "Calibri",
                shading: { type: ShadingType.SOLID, fill: badgeBg, color: badgeColor } }),
              new TextRun({ text: `   ${title}`, size: sz.lg, bold: true, color: slate900, font: "Calibri" }),
            ],
          })
        );
        parseBullets(content).forEach(item => {
          scopeContent!.push(new Paragraph({
            spacing: { after: 50 }, indent: { left: convertInchesToTwip(0.5) }, bullet: { level: 0 },
            children: [new TextRun({ text: item, size: sz.sm, color: slate600, font: "Calibri" })],
          }));
        });
      };

      if (fd.scopeGoals) addScope("1", "Goals & Objectives", fd.scopeGoals, green600, green100);
      if (fd.scopeProblems) addScope("2", "Current Problems & Pain Points", fd.scopeProblems, red600, red100);
      if (fd.scopeRequirements) addScope("3", "Functional Requirements", fd.scopeRequirements, blue600, blue100);
    }

    // ═══════════════════════════════════════════════════════════
    // SIGNATURES & FOOTER
    // ═══════════════════════════════════════════════════════════
    const sigContent: any[] = [spacer(300)];

    sigContent.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({ borders: noBorders, width: { size: 48, type: WidthType.PERCENTAGE }, children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Client Signature:", size: sz.sm, bold: true, color: slate900, font: "Calibri" })] }),
            spacer(400),
            new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: slate400 } }, children: [] }),
            spacer(200),
            new Paragraph({ children: [
              new TextRun({ text: "Date: ", size: sz.sm, color: slate500, font: "Calibri" }),
              new TextRun({ text: "_______________", size: sz.sm, color: slate400, font: "Calibri" }),
            ]}),
          ]}),
          new TableCell({ borders: noBorders, width: { size: 4, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [] })] }),
          new TableCell({ borders: noBorders, width: { size: 48, type: WidthType.PERCENTAGE }, children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "John Burkhardt, BKT Advisory", size: sz.sm, bold: true, color: slate900, font: "Calibri" })] }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "[Signed]", size: sz.sm, color: slate500, font: "Calibri", italics: true })] }),
            spacer(200),
            new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: slate400 } }, children: [] }),
            spacer(200),
            new Paragraph({ children: [
              new TextRun({ text: "Date: ", size: sz.sm, color: slate500, font: "Calibri" }),
              new TextRun({ text: today, size: sz.sm, color: slate700, font: "Calibri" }),
            ]}),
          ]}),
        ]})],
      })
    );

    sigContent.push(
      new Paragraph({
        spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 1, color: slate200 } },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "This quote is valid for 30 days from the date of generation.", size: sz.xs, color: slate400, font: "Calibri" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [new TextRun({ text: "Important: All Upwork Terms of Service and fees apply to this engagement.", size: sz.xs, color: slate400, font: "Calibri" })],
      })
    );
    if (hasFiles) {
      sigContent.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "*Final pricing subject to review of uploaded documentation.", size: sz.xs, color: blue600, font: "Calibri", bold: true })],
      }));
    }

    // ═══════════════════════════════════════════════════════════
    // ASSEMBLE DOCUMENT
    // ═══════════════════════════════════════════════════════════
    const pageMargins = {
      page: { margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.5), left: convertInchesToTwip(0.7), right: convertInchesToTwip(0.7) } },
    };
    const sections: any[] = [];

    if (scopeContent) {
      sections.push({ properties: pageMargins, children: page1 });
      sections.push({ properties: pageMargins, children: [...scopeContent, ...sigContent] });
    } else {
      sections.push({ properties: pageMargins, children: [...page1, ...sigContent] });
    }

    const doc = new DocxDocument({
      creator: "BKT Advisory",
      title: `Professional Services Quote - ${fd.firstName} ${fd.lastName}`,
      description: "Generated by BKT Advisory Tech Project Estimator",
      sections,
    });

    const blob = await Packer.toBlob(doc);
    const docxFilename = `${getQuoteBasename()}.docx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docxFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`Google Doc (.docx) generated: ${docxFilename}`);
  };

  // --- Mobile-Specific: Template-Based .docx Generation (docxtemplater + pizzip) ---
  // Fetches /BKT_Quote - TEMPLATE.docx, fills placeholders, downloads with dynamic name.
  // Bypasses html-to-image PDF entirely on mobile viewports.
  // @ts-expect-error reserved for Phase 3 mobile .docx generation
  const _generateMobileQuoteDocx = async () => {
    const fd = data.formData;
    const today = new Date();
    const dateStr = today.toLocaleDateString().replace(/\//g, '-');

    // Dynamic filename: BKT_Quote - {CompanyName || Client} - {date}.docx
    let entityName = 'Client';
    if (fd.companyName && fd.companyName.trim()) {
      entityName = fd.companyName.trim();
    } else if (fd.firstName || fd.lastName) {
      entityName = `${fd.firstName || ''} ${fd.lastName || ''}`.trim() || 'Client';
    }
    const sanitized = entityName.replace(/[\/\\?%*:|"<>]/g, '-').trim();
    const mobileFilename = `BKT_Quote - ${sanitized} - ${dateStr}.docx`;

    console.log(`[Mobile DOCX] Starting template-based generation: ${mobileFilename}`);

    // ── Step 1: Fetch the Word template from public directory ──
    let templateBuffer: ArrayBuffer;
    try {
      const templateUrl = '/BKT_Quote - TEMPLATE.docx';
      console.log(`[Mobile DOCX] Fetching template from: ${templateUrl}`);
      const resp = await fetch(templateUrl);

      if (!resp.ok) {
        throw new Error(`Template fetch failed: ${resp.status} ${resp.statusText}`);
      }

      // Validate Content-Type — SPA fallback routing may return 200 OK with HTML
      const contentType = resp.headers.get('Content-Type') || '';
      const isValidDocx =
        contentType.includes('application/vnd.openxmlformats') ||
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/zip');

      if (!isValidDocx) {
        throw new Error(`Invalid Content-Type "${contentType}" — expected .docx but likely received SPA fallback HTML`);
      }

      templateBuffer = await resp.arrayBuffer();

      // Double-check ZIP signature (PK header: 0x50 0x4B 0x03 0x04)
      const header = new Uint8Array(templateBuffer.slice(0, 4));
      if (header[0] !== 0x50 || header[1] !== 0x4B) {
        throw new Error('Response is not a valid ZIP/.docx file (missing PK signature)');
      }

      console.log(`[Mobile DOCX] Template loaded: ${(templateBuffer.byteLength / 1024).toFixed(1)} KB`);
    } catch (fetchErr) {
      // Graceful fallback: use the programmatic docx builder if template not found
      console.warn('[Mobile DOCX] Template not available, falling back to programmatic DOCX builder:', fetchErr);
      await generateQuoteDocx();
      return;
    }

    // ── Step 2: Load template into PizZip + Docxtemplater ──
    let zip: InstanceType<typeof PizZip>;
    let templateDoc: InstanceType<typeof Docxtemplater>;
    try {
      zip = new PizZip(templateBuffer);
      templateDoc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        // Silently replace missing tags with empty string
        nullGetter: () => '',
      });
    } catch (zipErr) {
      console.error('[Mobile DOCX] Error parsing template:', zipErr);
      // Fallback to programmatic builder
      await generateQuoteDocx();
      return;
    }

    // ── Step 3: Map formData + quote calculations to template variables ──
    // Arrays are joined into clean comma-separated strings
    const parseBulletText = (text: string): string => {
      if (!text) return '';
      return text
        .split(/[\n•]/)
        .filter(item => item.trim().length > 0)
        .map(item => `• ${item.trim()}`)
        .join('\n');
    };

    const templateData = {
      // Contact / Client Info
      firstName: fd.firstName || '',
      lastName: fd.lastName || '',
      fullName: `${fd.firstName || ''} ${fd.lastName || ''}`.trim(),
      companyName: fd.companyName || '',
      preparedFor: fd.companyName || `${fd.firstName || ''} ${fd.lastName || ''}`.trim(),
      website: fd.website || '',
      workEmail: fd.workEmail || '',
      mobilePhone: fd.mobilePhone || '',

      // Multi-Select Arrays → comma-separated strings
      crmPlatforms: fd.selectedCRMs.join(', '),
      salesforceClouds: fd.selectedClouds.join(', '),
      integrations: fd.selectedIntegrations.join(', '),
      aiTools: fd.selectedAITools.join(', '),
      services: fd.additionalModules.join(', '),
      powerUps: fd.powerUps.join(', '),

      // Boolean flags for conditional sections
      hasCRMs: fd.selectedCRMs.length > 0,
      hasClouds: fd.selectedClouds.length > 0,
      hasIntegrations: fd.selectedIntegrations.length > 0,
      hasAITools: fd.selectedAITools.length > 0,
      hasServices: fd.additionalModules.length > 0,
      hasPowerUps: fd.powerUps.length > 0,
      hasCompanyName: !!fd.companyName,
      hasWebsite: !!fd.website,
      hasFiles: hasFiles,
      hasScope: hasScope,

      // Project Configuration
      deliveryTeam: `${fd.deliveryTeam.charAt(0).toUpperCase() + fd.deliveryTeam.slice(1)} (USA/SA/Europe)`,
      projectDescription: fd.projectDescription || '',

      // Value Statement
      valueStatement: fd.valueStatement || 'This customized solution will streamline your operations, increase efficiency, and provide a predictable growth engine for your organization through strategic CRM architecture and AI-powered automation.',

      // Cost Breakdown
      baseHours: `${data.baseHours}`,
      adjustedHours: `${data.adjustedHours}`,
      hoursMatch: data.baseHours === data.adjustedHours,
      adminRate: `$${data.adminRate}`,
      developerRate: `$${data.developerRate}`,
      powerUpRate: data.powerUpRate > 0 ? `+$${data.powerUpRate}/hr` : '',
      hasPowerUpRate: data.powerUpRate > 0,
      finalHourlyRate: `$${data.finalHourlyRate}`,
      totalCost: `$${data.totalCost.toLocaleString()}`,
      estimatedWeeks: `${data.estimatedWeeks}`,

      // Payment Terms
      upfrontPayment: `$${upfrontPayment.toLocaleString()}`,
      midpointPayment: `$${midpointPayment.toLocaleString()}`,

      // Scope Sections (bullet-formatted text)
      scopeGoals: parseBulletText(fd.scopeGoals),
      scopeProblems: parseBulletText(fd.scopeProblems),
      scopeRequirements: parseBulletText(fd.scopeRequirements),
      hasScopeGoals: !!fd.scopeGoals,
      hasScopeProblems: !!fd.scopeProblems,
      hasScopeRequirements: !!fd.scopeRequirements,

      // Uploaded Files
      uploadedFiles: hasFiles
        ? fd.uploadedFiles.map(f => ({ name: f.name }))
        : [],

      // Metadata
      date: today.toLocaleDateString(),
      quoteDate: dateStr,
    };

    // ── Step 4: Render the template with data ──
    try {
      templateDoc.render(templateData);
    } catch (renderErr: any) {
      console.error('[Mobile DOCX] Template render error:', renderErr);
      if (renderErr.properties && renderErr.properties.errors) {
        console.error('[Mobile DOCX] Detailed errors:', JSON.stringify(renderErr.properties.errors, null, 2));
      }
      // Fallback to programmatic builder
      await generateQuoteDocx();
      return;
    }

    // ── Step 5: Generate blob and trigger download via URL.createObjectURL ──
    const outputBlob = (templateDoc as { getZip: () => { generate: (opts: Record<string, string>) => Blob } }).getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const downloadUrl = URL.createObjectURL(outputBlob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = mobileFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);

    console.log(`[Mobile DOCX] Template-based quote downloaded: ${mobileFilename}`);
  };

  const handleDownloadQuote = async () => {
    if (isGenerating) return;

    // ── UNIFIED PATH: html-to-image PDF from hidden A4 container (all devices) ──
    if (!pdfCaptureRef.current) return;
    setIsGenerating(true);
    
    // Store and temporarily remove problematic external stylesheets (like Google Calendar) 
    // that cause CORS errors in html-to-image
    const hiddenStyles: { node: Element, parent: Node, nextSibling: Node | null }[] = [];
    
    try {
      // Remove all problematic external stylesheets (Google Calendar, Figma S3, etc.)
      document.querySelectorAll('link[rel="stylesheet"][href*="://"]').forEach(style => {
        const href = style.getAttribute('href') || '';
        if (
          href.includes('calendar.google.com') ||
          href.includes('s3-figma-foundry') ||
          (href.includes('figma.com') && !href.includes(window.location.hostname))
        ) {
          if (style.parentNode) {
            hiddenStyles.push({
              node: style,
              parent: style.parentNode,
              nextSibling: style.nextSibling
            });
            style.parentNode.removeChild(style);
          }
        }
      });

      // Initialize PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210; // A4 width in mm

      // Ensure Plus Jakarta Sans is loaded before capture
      try {
        await document.fonts.ready;
        // Also explicitly wait for the specific font family
        await document.fonts.load("400 16px 'Plus Jakarta Sans'");
        await document.fonts.load("500 16px 'Plus Jakarta Sans'");
        await document.fonts.load("600 16px 'Plus Jakarta Sans'");
        await document.fonts.load("700 16px 'Plus Jakarta Sans'");
      } catch (fontErr) {
        console.warn('Font preload warning (non-fatal):', fontErr);
      }

      // Brief delay for any pending paint in the hidden container
      await new Promise(resolve => setTimeout(resolve, 200));

      const pageHeight = 297; // A4 height in mm
      const safePageHeight = 295; // Safety margin to prevent sub-pixel overflow

      // Helper: render a captured image across one or more PDF pages
      const addImageToPages = (imgData: string, elWidth: number, elHeight: number, isFirstSection: boolean) => {
        const imgHeight = (elHeight * imgWidth) / elWidth;
        // Clamp: if image fits within a single page (with tolerance), render as one page
        const clampedHeight = imgHeight <= pageHeight ? Math.min(imgHeight, safePageHeight) : imgHeight;

        if (!isFirstSection) pdf.addPage();

        if (clampedHeight <= safePageHeight) {
          // Single page — place image at top, clamped to safe height
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, clampedHeight);
        } else {
          // Multi-page — slice across pages
          let remaining = clampedHeight;
          let yOffset = 0;
          while (remaining > 0) {
            if (yOffset > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, clampedHeight);
            yOffset += pageHeight;
            remaining -= pageHeight;
          }
        }
      };

      // Strip external stylesheets/styles from cloned document to prevent CORS errors
      const cleanClonedDoc = (rawDoc: unknown) => {
        const doc = rawDoc as unknown as Document;
        doc.querySelectorAll('link[rel="stylesheet"]').forEach((link: Element) => {
          const href = link.getAttribute('href') || '';
          if (
            href.startsWith('http') &&
            !href.includes(window.location.hostname) &&
            !href.includes('fonts.googleapis.com') &&
            !href.includes('fonts.gstatic.com')
          ) {
            link.remove();
          }
        });
        doc.querySelectorAll('style').forEach((style: Element) => {
          const content = style.textContent || '';
          if (content.includes('s3-figma-foundry') || content.includes('figma.com')) {
            style.remove();
          }
        });
      };

      // --- PAGE 1 (and beyond): ESTIMATE SUMMARY ---
      const summaryEl = document.getElementById('capture-summary');
      if (summaryEl) {
        const summaryImg = await toPng(summaryEl, {
          quality: 1.0,
          pixelRatio: 2,
          skipFonts: false,
          preferredFontFormat: 'woff2',
          filter: toPngFilter,
          backgroundColor: '#ffffff',
          width: summaryEl.scrollWidth,
          height: summaryEl.scrollHeight,
          style: { boxSizing: 'border-box' },
          onclone: cleanClonedDoc,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        addImageToPages(summaryImg, summaryEl.scrollWidth, summaryEl.scrollHeight, true);
      }

      // --- SCOPE: Force a new page, then capture ---
      const scopeEl = document.getElementById('capture-scope');
      if (hasScope && scopeEl) {
        const scopeImg = await toPng(scopeEl, {
          quality: 1.0,
          pixelRatio: 2,
          skipFonts: false,
          preferredFontFormat: 'woff2',
          filter: toPngFilter,
          backgroundColor: '#ffffff',
          width: scopeEl.scrollWidth,
          height: scopeEl.scrollHeight,
          style: { boxSizing: 'border-box' },
          onclone: cleanClonedDoc,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        addImageToPages(scopeImg, scopeEl.scrollWidth, scopeEl.scrollHeight, false);
      }

      // Convert to Base64
      const pdfBase64 = pdf.output('datauristring');
      
      // Check size (approximate)
      const sizeInBytes = pdfBase64.length * 0.75;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      console.log(`Generated PDF Size: ${sizeInMB.toFixed(2)} MB`);
      
      const filename = getQuoteFilename();

      if (sizeInMB > 5.5) {
        console.warn('PDF size is close to or exceeds Supabase Edge Function limit (6MB)');
        alert('The generated PDF is too large to email automatically, but it will still be downloaded.');
        pdf.save(filename);
        return;
      }

      // Send to API
      await handleNotify(pdfBase64);

      // Download PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    } finally {
      // Restore hidden styles
      hiddenStyles.forEach(({ node, parent, nextSibling }) => {
        parent.insertBefore(node, nextSibling);
      });
      
      setIsGenerating(false);
    }
  };

  const handleNotify = async (pdfBase64: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-07a007e1/submit-quote`, 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...data,
            pdfBase64: pdfBase64 
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }
      
      const result = await response.json();
      console.log('Submission result:', result);
      
      // Show success message
      alert('Quote saved! A copy has been emailed to you and our team.');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Your quote was generated, but we could not email a copy at this time. Please save the PDF.');
    }
  };

  const upfrontPayment = Math.round(data.totalCost * 0.5);
  const midpointPayment = data.totalCost - upfrontPayment;
  const hoursMatch = data.baseHours === data.adjustedHours;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky wrapper for header (matching Estimator pattern) */}
      <div className="sticky top-[80px] z-40 shadow-md">
        <header className="bg-gradient-to-r from-[#0F172B] via-[#1e293b] to-[#0F172B] text-white py-4 px-4 md:py-6 md:px-8">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeftIcon size={20} />
                <span className="hidden md:inline">Back to Estimator</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <div>
                <h1 className="text-2xl mb-1 hidden md:block">BKT Advisory</h1>
                <p className="text-slate-300 text-sm m-0">
                  <span className="md:hidden">BKT Project Quote</span>
                  <span className="hidden md:inline">Project Quote</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadQuote}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ${
                isGenerating ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isMobile ? <FileIcon size={18} /> : <PrinterIcon size={18} />}
              <span>{isGenerating ? 'Generating...' : (isMobile ? 'Download' : 'Download Quote')}</span>
            </button>
          </div>
        </header>
      </div>

      {/* Quote Content */}
      <div className="max-w-[210mm] w-[95%] mx-auto px-0 py-3 md:w-full md:px-4 md:py-8">
        {/* Tabs Interface */}
        {hasScope && (
          <div className="flex gap-1 mb-0 mx-0 border-b border-slate-200 rounded-t-lg">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-2 rounded-t-lg text-sm font-medium transition-colors border-t border-x ${
                activeTab === 'summary' 
                  ? 'bg-white border-slate-200 text-blue-700 -mb-px' 
                  : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Estimate Summary
            </button>
            <button
              onClick={() => setActiveTab('scope')}
              className={`px-6 py-2 rounded-t-lg text-sm font-medium transition-colors border-t border-x ${
                activeTab === 'scope' 
                  ? 'bg-white border-slate-200 text-blue-700 -mb-px' 
                  : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Detailed Scope
            </button>
          </div>
        )}

        <div ref={quoteRef} className={"bg-white shadow-sm border border-slate-200 p-4 md:p-8 min-h-[297mm] w-full " + (hasScope ? "rounded-b-lg rounded-tr-lg" : "rounded-lg")}>
          
          {/* Document Header */}
          <div id="quote-header" className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-start md:text-left border-b-4 border-blue-700 pb-6 mb-5">
            <div className="flex flex-col items-center md:flex-row md:items-center gap-4 md:gap-6">
              <img 
                src={logoImage} 
                alt="BKT Advisory" 
                className="w-16 h-16 rounded-full object-contain bg-white shadow-sm border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-3xl text-[#0F172B] mb-1">BKT Advisory</h1>
                <p className="text-slate-600">Salesforce & AI Systems Consulting</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Top Rated on Upwork</span>
                </div>
              </div>
            </div>

            {/* Consultant Info - Moved to Header */}
            <div className="flex flex-col items-center md:items-end gap-1 mt-4 md:mt-0 md:text-right">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-slate-900 font-bold">John Burkhardt</h3>
                  <p className="text-sm text-slate-600">Principal Consultant</p>
                </div>
                <img 
                  src={profileImage} 
                  alt="John Burkhardt" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200"
                />
              </div>
            </div>
          </div>

          <h2 className="text-2xl text-slate-900 mx-[0px] mt-[6px] mb-[20px] px-[0px] py-[6px]">
            {activeTab === 'summary' ? 'Professional Services Quote' : 'Detailed Scope of Work'}
          </h2>

          {/* TAB 1: ESTIMATE SUMMARY */}
          {activeTab === 'summary' && (
            <>

          {/* Section 1: Top (Full Width) */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-5 rounded-lg border-l-4 border-blue-700">
              <h3 className="text-blue-700 mb-2 font-semibold">Project Value Statement</h3>
              <p className="text-slate-700 text-sm italic">
                {data.formData.valueStatement || "This customized solution will streamline your operations, increase efficiency, and provide a predictable growth engine for your organization through strategic CRM architecture and AI-powered automation."}
              </p>
            </div>
          </div>

          {/* Section 2: Middle (2-Column Grid on desktop, 1-col on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
            
            {/* Left Column (60% on desktop, full on mobile) - SCREEN VIEW */}
            <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
              <div className="bg-slate-50 p-5 rounded-lg h-full">
                <h3 className="mb-3 font-bold text-slate-900 h-6">Project Overview</h3>
                <div className="space-y-2 text-sm">
                  {/* Prepared For Logic */}
                  {data.formData.companyName ? (
                    <>
                      <p>
                        <span className="text-slate-600">Prepared for:</span>{' '}
                        <span className="font-medium">{data.formData.companyName}</span>
                      </p>
                      <p>
                        <span className="text-slate-600">Client:</span>{' '}
                        <span className="font-medium">{data.formData.firstName} {data.formData.lastName}</span>
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="text-slate-600">Prepared for:</span>{' '}
                      <span className="font-medium">{data.formData.firstName} {data.formData.lastName}</span>
                    </p>
                  )}
                  {data.formData.website && (
                    <p>
                      <span className="text-slate-600">Website:</span>{' '}
                      <span>{data.formData.website}</span>
                    </p>
                  )}
                  {data.formData.selectedCRMs.length > 0 && (
                    <p>
                      <span className="text-slate-600">CRM Platforms:</span>{' '}
                      <span>{data.formData.selectedCRMs.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.selectedClouds.length > 0 && (
                    <p>
                      <span className="text-slate-600">Salesforce Clouds:</span>{' '}
                      <span>{data.formData.selectedClouds.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.selectedIntegrations.length > 0 && (
                    <p>
                      <span className="text-slate-600">Integrations:</span>{' '}
                      <span>{data.formData.selectedIntegrations.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.selectedAITools.length > 0 && (
                    <p>
                      <span className="text-slate-600">AI Tools:</span>{' '}
                      <span>{data.formData.selectedAITools.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.additionalModules.length > 0 && (
                    <div>
                      <span className="text-slate-600">Services:</span>{' '}
                      {data.formData.additionalModules.length <= 2 ? (
                        <span>{data.formData.additionalModules.join(', ')}</span>
                      ) : (
                        <ul className="list-disc list-outside mt-0.5 space-y-0 leading-tight pl-[26px] pr-[0px] py-[0px] marker:text-xs marker:text-slate-700">
                          {data.formData.additionalModules.map((module, i) => (
                            <li key={i} className="text-sm text-slate-700">{module.replace(/^•\s*/, '')}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <p>
                    <span className="text-slate-600">Delivery Team:</span>{' '}
                    <span className="capitalize">{data.formData.deliveryTeam} (USA/SA/Europe)</span>
                  </p>
                  {data.formData.powerUps.length > 0 && (
                    <p>
                      <span className="text-slate-600">Selected Power-Ups:</span>{' '}
                      <span>{data.formData.powerUps.join(', ')}</span>
                    </p>
                  )}

                  <div className="pt-4 mt-2 border-t border-slate-200">
                    <p className="text-sm">
                      <span className="font-bold text-slate-700">Estimated Timeline:</span>{' '}
                      <span>{data.estimatedWeeks} weeks</span> (assuming 25 hours per week)
                    </p>
                  </div>
                </div>
              </div>

              {/* Scope moved to dedicated tab */}
            </div>

            {/* Right Column (40% on desktop, full on mobile) */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              
              {/* Cost Breakdown */}
              <div className="border-2 border-blue-700 rounded-lg p-5 bg-white">
                <h3 className="mb-4 font-bold text-slate-900 h-6">
                  <span className="md:hidden">Cost Breakdown</span>
                  <span className="hidden md:inline">Detailed Cost Breakdown</span>
                </h3>
                
                <div className="space-y-2 text-sm">
                  {hoursMatch ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Total Hours:</span>
                      <span className="font-medium">{data.baseHours} hrs</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Base Project Hours:</span>
                        <span>{data.baseHours} hrs</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Adjusted Hours:</span>
                        <span className="font-medium">{data.adjustedHours} hrs</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Admin Rate (40%):</span>
                    <span>${data.adminRate}/hr</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Developer Rate (60%):</span>
                    <span>${data.developerRate}/hr</span>
                  </div>
                  
                  {data.powerUpRate > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                      <span>+ Power-Ups:</span>
                      <span>+${data.powerUpRate}/hr</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Final Hourly Rate:</span>
                    <span>${data.finalHourlyRate}/hr</span>
                  </div>
                  <div className="flex flex-col items-end pt-4 mt-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Total Project Cost</span>
                    <div className="flex items-start gap-1">
                      <span className="text-2xl font-bold text-blue-700">${data.totalCost.toLocaleString()}</span>
                      {hasFiles && <span className="text-blue-700 text-lg font-bold">*</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Files Received (Conditional) */}
              {hasFiles && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Files Received</h4>
                  <div className="space-y-1">
                    {data.formData.uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckIcon size={12} className="text-green-500" />
                        <span className="truncate max-w-[180px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Terms Cards */}
              <div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Upfront (50%)</p>
                    <div className="text-lg font-bold text-blue-700 mb-1">
                      ${upfrontPayment.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400">Due at start</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Midpoint (50%)</p>
                    <div className="text-lg font-bold text-blue-700 mb-1">
                      ${midpointPayment.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400">Due at milestone</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 text-center italic px-2">
                  *Payment terms subject to final agreement.
                </div>
              </div>

            </div>
          </div>

          {/* End of TAB 1 */}
            </>
          )}

          {/* TAB 2: DETAILED SCOPE */}
          {activeTab === 'scope' && (
            <div className="mb-6 space-y-6">
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <p className="text-slate-700 mb-6 italic">
                  The following sections outline the specific problems, requirements, and goals for this engagement based on our initial discovery.
                </p>

                <div className="space-y-8">
                  {data.formData.scopeGoals && (
                    <div>
                      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">1</div>
                        <h3 className="text-lg font-bold text-slate-900">Goals & Objectives</h3>
                      </div>
                      <div className="pl-10">
                        {renderList(data.formData.scopeGoals)}
                      </div>
                    </div>
                  )}

                  {data.formData.scopeProblems && (
                    <div>
                      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">2</div>
                        <h3 className="text-lg font-bold text-slate-900">Current Problems & Pain Points</h3>
                      </div>
                      <div className="pl-10">
                        {renderList(data.formData.scopeProblems)}
                      </div>
                    </div>
                  )}
                  
                  {data.formData.scopeRequirements && (
                    <div>
                      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                        <h3 className="text-lg font-bold text-slate-900">Functional Requirements</h3>
                      </div>
                      <div className="pl-10">
                        {renderList(data.formData.scopeRequirements)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Bottom (Full Width) */}
          <div id="quote-footer" className="space-y-6">
            
            {/* Signatures */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900">Client Signature:</span>
                <div className="mt-8 border-b border-slate-400"></div>
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-sm text-slate-500">Date:</span>
                  <div className="flex-1 border-b border-slate-400 h-6"></div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900">John Burkhardt, BKT Advisory</span>
                <div className="mt-8 border-b border-slate-400 relative">
                  <img 
                    src={signatureImage} 
                    alt="Signature" 
                    className="absolute bottom-0 left-0 h-24 w-auto max-w-[200px] object-contain mix-blend-multiply pointer-events-none mx-[0px] mt-[0px] mb-[-45px]" 
                  />
                </div>
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-sm text-slate-500">Date:</span>
                  <div className="flex-1 border-b border-slate-400 h-6 flex items-end px-2 text-sm text-slate-700">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
              <p className="text-[12px]">This quote is valid for 30 days from the date of generation.</p>
              <p className="text-[12px]">Important: All Upwork Terms of Service and fees apply to this engagement.</p>
              {hasFiles && (
                <p className="text-[12px] text-blue-600 font-medium pt-1">
                  *Final pricing subject to review of uploaded documentation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HIDDEN A4 CONTAINER — Always renders desktop layout for PDF capture ═══ */}
      <div className="absolute left-[-9999px] top-0 overflow-hidden" aria-hidden="true">
        <div ref={pdfCaptureRef} className="bg-transparent">
          
          {/* ═══ CAPTURE-SUMMARY: Header + Value Statement + Grid ═══ */}
          <div id="capture-summary" className="p-10 bg-white w-[210mm] h-auto overflow-hidden" style={{ boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>

          {/* Document Header — desktop layout forced (no md: prefixes) */}
          <div className="flex flex-row justify-between items-start text-left border-b-4 border-blue-700 pb-6 mb-5">
            <div className="flex flex-row items-center gap-6">
              <img 
                src={logoImage} 
                alt="BKT Advisory" 
                className="w-16 h-16 rounded-full object-contain bg-white shadow-sm border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-3xl text-[#0F172B] mb-1">BKT Advisory</h1>
                <p className="text-slate-600">Salesforce & AI Systems Consulting</p>
                <div className="flex items-center justify-start gap-2 mt-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Top Rated on Upwork</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-slate-900 font-bold">John Burkhardt</h3>
                  <p className="text-sm text-slate-600">Principal Consultant</p>
                </div>
                <img 
                  src={profileImage} 
                  alt="John Burkhardt" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* ═══ PAGE 1: ESTIMATE SUMMARY ═══ */}
          <h2 className="text-2xl text-slate-900 mx-[0px] mt-[6px] mb-[20px] px-[0px] py-[6px]">
            Professional Services Quote
          </h2>

          {/* Value Statement */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-5 rounded-lg border-l-4 border-blue-700">
              <h3 className="text-blue-700 mb-2 font-semibold">Project Value Statement</h3>
              <p className="text-slate-700 text-sm italic">
                {data.formData.valueStatement || "This customized solution will streamline your operations, increase efficiency, and provide a predictable growth engine for your organization through strategic CRM architecture and AI-powered automation."}
              </p>
            </div>
          </div>

          {/* 2-Column Grid — forced desktop 3/5 + 2/5 layout */}
          <div className="grid grid-cols-5 gap-6 mb-4">
            {/* Left Column (60%) - PDF CAPTURE */}
            <div className="col-span-3 flex flex-col gap-6">
              <div className="bg-slate-50 p-5 rounded-lg h-full">
                <h3 className="mb-3 font-bold text-slate-900 h-6">Project Overview</h3>
                <div className="space-y-2 text-sm">
                  {data.formData.companyName ? (
                    <>
                      <p>
                        <span className="text-slate-600">Prepared for:</span>{' '}
                        <span className="font-medium">{data.formData.companyName}</span>
                      </p>
                      <p>
                        <span className="text-slate-600">Client:</span>{' '}
                        <span className="font-medium">{data.formData.firstName} {data.formData.lastName}</span>
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="text-slate-600">Prepared for:</span>{' '}
                      <span className="font-medium">{data.formData.firstName} {data.formData.lastName}</span>
                    </p>
                  )}
                  {data.formData.website && (
                    <p>
                      <span className="text-slate-600">Website:</span>{' '}
                      <span>{data.formData.website}</span>
                    </p>
                  )}
                  {data.formData.selectedCRMs.length > 0 && (
                    <p>
                      <span className="text-slate-600">CRM Platforms:</span>{' '}
                      <span>{data.formData.selectedCRMs.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.selectedClouds.length > 0 && (
                    <p>
                      <span className="text-slate-600">Salesforce Clouds:</span>{' '}
                      <span>{data.formData.selectedClouds.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.selectedIntegrations.length > 0 && (
                    <p>
                      <span className="text-slate-600">Integrations:</span>{' '}
                      <span>{data.formData.selectedIntegrations.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.selectedAITools.length > 0 && (
                    <p>
                      <span className="text-slate-600">AI Tools:</span>{' '}
                      <span>{data.formData.selectedAITools.join(', ')}</span>
                    </p>
                  )}
                  {data.formData.additionalModules.length > 0 && (
                    <div>
                      <span className="text-slate-600">Services:</span>{' '}
                      {data.formData.additionalModules.length <= 2 ? (
                        <span>{data.formData.additionalModules.join(', ')}</span>
                      ) : (
                        <ul className="list-disc list-outside mt-0.5 space-y-0 leading-tight pl-[26px] pr-[0px] py-[0px] marker:text-xs marker:text-slate-700">
                          {data.formData.additionalModules.map((module, i) => (
                            <li key={i} className="text-sm text-slate-700">{module.replace(/^•\s*/, '')}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  <p>
                    <span className="text-slate-600">Delivery Team:</span>{' '}
                    <span className="capitalize">{data.formData.deliveryTeam} (USA/SA/Europe)</span>
                  </p>
                  {data.formData.powerUps.length > 0 && (
                    <p>
                      <span className="text-slate-600">Selected Power-Ups:</span>{' '}
                      <span>{data.formData.powerUps.join(', ')}</span>
                    </p>
                  )}
                  <div className="pt-4 mt-2 border-t border-slate-200">
                    <p className="text-sm">
                      <span className="font-bold text-slate-700">Estimated Timeline:</span>{' '}
                      <span>{data.estimatedWeeks} weeks</span> (assuming 25 hours per week)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (40%) */}
            <div className="col-span-2 space-y-4">
              {/* Cost Breakdown */}
              <div className="border-2 border-blue-700 rounded-lg p-5 bg-white">
                <h3 className="mb-4 font-bold text-slate-900 h-6">Detailed Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  {hoursMatch ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Total Hours:</span>
                      <span className="font-medium">{data.baseHours} hrs</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Base Project Hours:</span>
                        <span>{data.baseHours} hrs</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Adjusted Hours:</span>
                        <span className="font-medium">{data.adjustedHours} hrs</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Admin Rate (40%):</span>
                    <span>${data.adminRate}/hr</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Developer Rate (60%):</span>
                    <span>${data.developerRate}/hr</span>
                  </div>
                  {data.powerUpRate > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                      <span>+ Power-Ups:</span>
                      <span>+${data.powerUpRate}/hr</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Final Hourly Rate:</span>
                    <span>${data.finalHourlyRate}/hr</span>
                  </div>
                  <div className="flex flex-col items-end pt-4 mt-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Total Project Cost</span>
                    <div className="flex items-start gap-1">
                      <span className="text-2xl font-bold text-blue-700">${data.totalCost.toLocaleString()}</span>
                      {hasFiles && <span className="text-blue-700 text-lg font-bold">*</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Files Received */}
              {hasFiles && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Files Received</h4>
                  <div className="space-y-1">
                    {data.formData.uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckIcon size={12} className="text-green-500" />
                        <span className="truncate max-w-[180px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Terms */}
              <div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Upfront (50%)</p>
                    <div className="text-lg font-bold text-blue-700 mb-1">
                      ${upfrontPayment.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400">Due at start</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Midpoint (50%)</p>
                    <div className="text-lg font-bold text-blue-700 mb-1">
                      ${midpointPayment.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400">Due at milestone</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 text-center italic px-2">
                  *Payment terms subject to final agreement.
                </div>
              </div>
            </div>
          </div>

          {/* When no scope exists, signatures & footer must live inside capture-summary */}
          {!hasScope && (
            <div className="space-y-6">
              <div className="pt-2 grid grid-cols-2 gap-12">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">Client Signature:</span>
                  <div className="mt-8 border-b border-slate-400"></div>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-sm text-slate-500">Date:</span>
                    <div className="flex-1 border-b border-slate-400 h-6"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900">John Burkhardt, BKT Advisory</span>
                  <div className="mt-8 border-b border-slate-400 relative">
                    <img 
                      src={signatureImage} 
                      alt="Signature" 
                      className="absolute bottom-0 left-0 h-24 w-auto max-w-[200px] object-contain mix-blend-multiply pointer-events-none mx-[0px] mt-[0px] mb-[-45px]" 
                    />
                  </div>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-sm text-slate-500">Date:</span>
                    <div className="flex-1 border-b border-slate-400 h-6 flex items-end px-2 text-sm text-slate-700">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
                <p className="text-[12px]">This quote is valid for 30 days from the date of generation.</p>
                <p className="text-[12px]">Important: All Upwork Terms of Service and fees apply to this engagement.</p>
                {hasFiles && (
                  <p className="text-[12px] text-blue-600 font-medium pt-1">
                    *Final pricing subject to review of uploaded documentation.
                  </p>
                )}
              </div>
            </div>
          )}

          </div>
          {/* ═══ END CAPTURE-SUMMARY ═══ */}

          {/* ═══ CAPTURE-SCOPE: Scope + Signatures + Footer ═══ */}
          <div id="capture-scope" className="p-10 bg-white w-[210mm] h-auto overflow-hidden" style={{ boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>

          {/* ═══ PAGE 2: DETAILED SCOPE (rendered inline, no tab gating) ═══ */}
          {hasScope && (
            <>
              {/* Scope header */}
              <div className="pt-8 border-t-4 border-blue-700">
                <h2 className="text-2xl text-slate-900 mx-[0px] mt-[6px] mb-[20px] px-[0px] py-[6px]">
                  Detailed Scope of Work
                </h2>
              </div>

              <div className="mb-6 space-y-6">
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                  <p className="text-slate-700 mb-6 italic">
                    The following sections outline the specific problems, requirements, and goals for this engagement based on our initial discovery.
                  </p>
                  <div className="space-y-4">
                    {data.formData.scopeGoals && (
                      <div>
                        <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">1</div>
                          <h3 className="text-lg font-bold text-slate-900">Goals & Objectives</h3>
                        </div>
                        <div className="pl-10">
                          {renderList(data.formData.scopeGoals)}
                        </div>
                      </div>
                    )}
                    {data.formData.scopeProblems && (
                      <div>
                        <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">2</div>
                          <h3 className="text-lg font-bold text-slate-900">Current Problems & Pain Points</h3>
                        </div>
                        <div className="pl-10">
                          {renderList(data.formData.scopeProblems)}
                        </div>
                      </div>
                    )}
                    {data.formData.scopeRequirements && (
                      <div>
                        <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                          <h3 className="text-lg font-bold text-slate-900">Functional Requirements</h3>
                        </div>
                        <div className="pl-10">
                          {renderList(data.formData.scopeRequirements)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Signatures — forced desktop 2-col layout */}
          <div className="space-y-6">
            <div className="pt-2 grid grid-cols-2 gap-12">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900">Client Signature:</span>
                <div className="mt-8 border-b border-slate-400"></div>
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-sm text-slate-500">Date:</span>
                  <div className="flex-1 border-b border-slate-400 h-6"></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900">John Burkhardt, BKT Advisory</span>
                <div className="mt-8 border-b border-slate-400 relative">
                  <img 
                    src={signatureImage} 
                    alt="Signature" 
                    className="absolute bottom-0 left-0 h-24 w-auto max-w-[200px] object-contain mix-blend-multiply pointer-events-none mx-[0px] mt-[0px] mb-[-45px]" 
                  />
                </div>
                <div className="mt-8 flex items-end gap-2">
                  <span className="text-sm text-slate-500">Date:</span>
                  <div className="flex-1 border-b border-slate-400 h-6 flex items-end px-2 text-sm text-slate-700">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
              <p className="text-[12px]">This quote is valid for 30 days from the date of generation.</p>
              <p className="text-[12px]">Important: All Upwork Terms of Service and fees apply to this engagement.</p>
              {hasFiles && (
                <p className="text-[12px] text-blue-600 font-medium pt-1">
                  *Final pricing subject to review of uploaded documentation.
                </p>
              )}
            </div>
          </div>

          </div>
          {/* ═══ END CAPTURE-SCOPE ═══ */}

        </div>
      </div>
      {/* ═══ END HIDDEN A4 CONTAINER ═══ */}

    </div>
  );
}