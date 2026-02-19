import { useRef, useState } from 'react';
import { QuoteData } from '../App';
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
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

interface QuoteProps {
  data: QuoteData;
  onBack: () => void;
}

export function Quote({ data, onBack }: QuoteProps) {
  const quoteRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'scope'>('summary');

  const hasFiles = data.formData.uploadedFiles && data.formData.uploadedFiles.length > 0;
  
  // Check if scope exists (at least one field is populated)
  const hasScope = !!(
    data.formData.scopeProblems || 
    data.formData.scopeRequirements || 
    data.formData.scopeGoals
  );

  const renderList = (text: string) => {
    // Split by newline or bullet point and filter empty items
    const items = text.split(/[\n•]/).filter(item => item.trim().length > 0);
    
    if (items.length === 0) return null;

    return (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-slate-600 text-sm leading-snug">
            {item.trim()}
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

  const handleDownloadQuote = async () => {
    if (!quoteRef.current || isGenerating) return;

    // Capture current tab to restore later
    const originalTab = activeTab;
    setIsGenerating(true);
    
    // Store and temporarily remove problematic external stylesheets (like Google Calendar) 
    // that cause CORS errors in html-to-image
    const hiddenStyles: { node: Element, parent: Node, nextSibling: Node | null }[] = [];
    
    // Get header and footer elements for visibility toggling
    const quoteHeader = document.getElementById('quote-header');
    const quoteFooter = document.getElementById('quote-footer');
    
    try {
      document.querySelectorAll('link[href*="calendar.google.com"]').forEach(style => {
        if (style.parentNode) {
          hiddenStyles.push({
            node: style,
            parent: style.parentNode,
            nextSibling: style.nextSibling
          });
          style.parentNode.removeChild(style);
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
      const element = quoteRef.current;

      // --- PAGE 1: ESTIMATE SUMMARY ---
      // Force switch to summary tab
      setActiveTab('summary');
      
      // Page 1 Configuration: Show Header, Hide Footer
      if (quoteHeader) quoteHeader.style.display = ''; // Default display (flex)
      if (quoteFooter) quoteFooter.style.display = 'none';
      
      // Wait for React to render the summary view and DOM updates
      await new Promise(resolve => setTimeout(resolve, 250));

      const imgData1 = await toPng(element, { 
        quality: 0.8, 
        pixelRatio: 1.5, 
      });

      const elementWidth1 = element.offsetWidth;
      const elementHeight1 = element.offsetHeight;
      const imgHeight1 = (elementHeight1 * imgWidth) / elementWidth1;
      
      pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth, imgHeight1);

      // --- PAGE 2: DETAILED SCOPE (If Available) ---
      if (hasScope) {
        // Force switch to scope tab
        setActiveTab('scope');
        
        // Page 2 Configuration: Hide Header, Show Footer
        if (quoteHeader) quoteHeader.style.display = 'none';
        if (quoteFooter) quoteFooter.style.display = ''; // Default display (block)

        // Wait for React to render the scope view and DOM updates
        await new Promise(resolve => setTimeout(resolve, 250));

        const imgData2 = await toPng(element, { 
          quality: 0.8, 
          pixelRatio: 1.5, 
        });

        const elementWidth2 = element.offsetWidth;
        const elementHeight2 = element.offsetHeight;
        const imgHeight2 = (elementHeight2 * imgWidth) / elementWidth2;

        pdf.addPage();
        pdf.addImage(imgData2, 'PNG', 0, 0, imgWidth, imgHeight2);
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

      // Download
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    } finally {
      // Restore hidden styles and original tab
      hiddenStyles.forEach(({ node, parent, nextSibling }) => {
        parent.insertBefore(node, nextSibling);
      });
      
      // Restore Header/Footer visibility
      if (quoteHeader) quoteHeader.style.display = '';
      if (quoteFooter) quoteFooter.style.display = '';
      
      setActiveTab(originalTab);
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
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeftIcon size={20} />
            Back to Estimator
          </button>
          <button
            onClick={handleDownloadQuote}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors ${
              isGenerating ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <PrinterIcon size={18} />
            {isGenerating ? 'Generating PDF...' : 'Download / Save Quote'}
          </button>
        </div>
      </header>

      {/* Quote Content */}
      <div className="max-w-[210mm] mx-auto py-8">
        {/* Tabs Interface */}
        {hasScope && (
          <div className="flex gap-1 mb-0 mx-8 border-b border-slate-200">
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

        <div ref={quoteRef} className={`bg-white shadow-sm border border-slate-200 p-8 min-h-[297mm] ${hasScope ? 'rounded-b-lg rounded-tr-lg' : 'rounded-lg'}`}>
          
          {/* Document Header */}
          <div id="quote-header" className="flex justify-between items-start border-b-4 border-blue-700 pb-6 mb-5">
            <div className="flex items-center gap-6">
              <img 
                src={logoImage} 
                alt="BKT Advisory" 
                className="w-16 h-16 rounded-full object-contain bg-white shadow-sm border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-3xl text-blue-700 mb-1">BKT Advisory</h1>
                <p className="text-slate-600">Salesforce & AI Systems Consulting</p>
                <div className="flex items-center gap-2 mt-1">
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
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-slate-900 font-bold">John Burkhardt</h3>
                  <p className="text-sm text-slate-600">Principal Architect</p>
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

          {/* Section 2: Middle (2-Column Grid) */}
          <div className="grid grid-cols-5 gap-6 mb-4">
            
            {/* Left Column (60%) */}
            <div className="col-span-3 flex flex-col gap-6">
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
                        <ul className="list-disc mt-0.5 space-y-0 text-slate-900 leading-tight pl-[26px] pr-[0px] py-[0px]">
                          {data.formData.additionalModules.map((module, i) => (
                            <li key={i}>{module}</li>
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
      </div>
    </div>
  );
}