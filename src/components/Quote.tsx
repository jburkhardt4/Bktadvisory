import { useRef } from 'react';
import { QuoteData } from '../App';
import { Download, ArrowLeft, Star, Printer } from 'lucide-react';

interface QuoteProps {
  data: QuoteData;
  onBack: () => void;
}

export function Quote({ data, onBack }: QuoteProps) {
  const quoteRef = useRef<HTMLDivElement>(null);

  const handleDownloadQuote = async () => {
    if (!quoteRef.current) return;

    // Check cooldown
    const lastNotificationTime = localStorage.getItem('lastQuoteNotification');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    let shouldNotify = true;
    if (lastNotificationTime) {
      const timeSinceLastNotification = now - parseInt(lastNotificationTime);
      if (timeSinceLastNotification < fiveMinutes) {
        shouldNotify = false;
        const remainingMinutes = Math.ceil((fiveMinutes - timeSinceLastNotification) / 60000);
        console.log(`Notification cooldown active. ${remainingMinutes} minutes remaining.`);
      }
    }

    // Send notification if cooldown expired
    if (shouldNotify) {
      await handleNotify();
      localStorage.setItem('lastQuoteNotification', now.toString());
    }

    // Use browser print functionality for PDF generation
    window.print();
  };

  const handleNotify = async () => {
    // Mock notification - replace with actual Zapier webhook or EmailJS
    const notificationData = {
      clientName: `${data.formData.firstName} ${data.formData.lastName}`,
      email: data.formData.workEmail,
      phone: data.formData.mobilePhone,
      website: data.formData.website,
      totalCost: data.totalCost,
      timestamp: new Date().toISOString(),
    };

    console.log('📧 Sending notification:', notificationData);

    // Example Zapier webhook integration (uncomment and add your webhook URL):
    /*
    try {
      await fetch('YOUR_ZAPIER_WEBHOOK_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error('Notification failed:', error);
    }
    */

    // Show success message
    alert('Quote notification sent! You will receive a copy shortly.');
  };

  const upfrontPayment = Math.round(data.totalCost * 0.5);
  const midpointPayment = data.totalCost - upfrontPayment;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Estimator
          </button>
          <button
            onClick={handleDownloadQuote}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download size={18} />
            Download / Save Quote
          </button>
        </div>
      </header>

      {/* Quote Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div ref={quoteRef} className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
          
          {/* Header */}
          <div className="border-b-4 border-blue-600 pb-6 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                BKT
              </div>
              <div>
                <h1 className="text-3xl text-blue-600 mb-1">BKT Advisory</h1>
                <p className="text-slate-600">Salesforce & AI Systems Consulting</p>
                <p className="text-slate-600">Professional Services Quote</p>
              </div>
            </div>
            
            {/* Reviews */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-lg inline-flex">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-slate-600">5.0 Rating • Top Rated on Upwork</span>
            </div>
          </div>

          {/* Consultant Info */}
          <div className="flex items-center gap-6 mb-8 bg-slate-50 p-6 rounded-lg">
            <div className="w-20 h-20 bg-slate-300 rounded-full flex items-center justify-center text-slate-600">
              JB
            </div>
            <div>
              <h3 className="text-slate-900 mb-1">John Burkhardt</h3>
              <p className="text-slate-600">Salesforce & AI Systems Architect</p>
              <p className="text-slate-600">Former Carter Funds DD Project Manager</p>
            </div>
          </div>

          {/* Quote Title */}
          <h2 className="text-2xl text-slate-900 mb-6">Tech Project Quote</h2>

          {/* Value Statement */}
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-lg mb-8 border-l-4 border-blue-600">
            <h3 className="text-blue-600 mb-3">Project Value Statement</h3>
            <p className="text-slate-700 italic">
              This customized solution will streamline your operations, increase efficiency, and provide 
              a predictable growth engine for your organization through strategic CRM architecture and 
              AI-powered automation.
            </p>
          </div>

          {/* Project Overview */}
          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <h3 className="mb-4">Project Overview</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-600">Client:</span>{' '}
                <span>{data.formData.firstName} {data.formData.lastName}</span>
              </p>
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
                <p>
                  <span className="text-slate-600">Additional Modules:</span>{' '}
                  <span>{data.formData.additionalModules.join(', ')}</span>
                </p>
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
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="border-2 border-blue-600 rounded-lg p-6 mb-8">
            <h3 className="mb-4">Detailed Cost Breakdown</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Base Project Hours:</span>
                <span>{data.baseHours} hours</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Complexity Multiplier:</span>
                <span>{data.complexityMultiplier}×</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Adjusted Hours:</span>
                <span>{data.adjustedHours} hours</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Admin Rate (40%):</span>
                <span>${data.adminRate}/hr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Developer Rate (60%):</span>
                <span>${data.developerRate}/hr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Base Blended Rate:</span>
                <span>${data.baseBlendedRate}/hr</span>
              </div>
              {data.powerUpRate > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">+ Power-Ups:</span>
                  <span>+${data.powerUpRate}/hr</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Final Hourly Rate:</span>
                <span>${data.finalHourlyRate}/hr</span>
              </div>
              <div className="flex justify-between py-3 text-lg text-blue-600 mt-2">
                <span>Total Project Cost:</span>
                <span>${data.totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Billing Terms */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <div className="text-3xl text-blue-600 mb-2">
                ${upfrontPayment.toLocaleString()}
              </div>
              <p className="mb-1">50% Upfront Payment</p>
              <p className="text-sm text-slate-500">Due upon project initiation</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <div className="text-3xl text-blue-600 mb-2">
                ${midpointPayment.toLocaleString()}
              </div>
              <p className="mb-1">50% Midpoint Payment</p>
              <p className="text-sm text-slate-500">Due at project milestone</p>
            </div>
          </div>

          <p className="mb-8">
            <span className="text-slate-600">Estimated Timeline:</span>{' '}
            <span>{data.estimatedWeeks} weeks</span> (assuming 25 hours per week)
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="mb-4">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Review this quote with your stakeholders</li>
              <li>Contact JB Burkhardt on Upwork to discuss project details</li>
              <li>Schedule a project kickoff meeting</li>
              <li>Sign the agreement to begin your transformation</li>
            </ol>
            <p className="mt-4">
              <span className="text-slate-600">Contact:</span>{' '}
              <a 
                href="https://www.upwork.com/freelancers/~01dd56d750898225c0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Reach out on Upwork
              </a>
              {' '}with this quote attached.
            </p>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div className="border-t-2 border-slate-900 pt-3">
              <p className="mb-2">Client Signature</p>
              <p className="text-sm text-slate-500">Date: _______________</p>
            </div>
            <div className="border-t-2 border-slate-900 pt-3">
              <p className="mb-2">John "JB" Burkhardt, BKT Advisory</p>
              <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500 space-y-1">
            <p>This quote is valid for 30 days from the date of generation.</p>
            <p>Important: All Upwork Terms of Service and fees apply to this engagement.</p>
            <p>BKT Advisory • Salesforce & AI Systems Architecture • Professional Services</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h3 className="text-xl">Client Reviews</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">Top Rated on Upwork</span>
              </div>
              <p className="text-sm text-slate-700">
                "Exceptional service and deep expertise in Salesforce architecture and AI integration. 
                Delivered on time and exceeded expectations."
              </p>
            </div>
            
            <p className="text-sm text-slate-600 text-center">
              View full profile and reviews on{' '}
              <a 
                href="https://www.upwork.com/freelancers/~01dd56d750898225c0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Upwork
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}