import { Link } from 'react-router';
import { ScheduleCallButton } from './ScheduleCallButton';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#0F172B] via-slate-800 to-blue-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 pb-8 border-b border-neutral-800">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-white font-bold">BKT Advisory</h3>
            <p className="text-neutral-400 text-sm">
              Building predictable growth engines via Salesforce & AI for Startups, FinTech, and InsurTech.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white text-sm uppercase tracking-wide font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/work" className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                Work
              </Link>
              <Link to="/services" className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                Services
              </Link>
              <Link to="/process" className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                Process
              </Link>
              <Link to="/about" className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                About
              </Link>
              <a
                href="https://estimator.bktadvisory.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors text-left text-sm inline-flex items-center gap-1"
              >
                Project Estimator
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white text-sm uppercase tracking-wide font-semibold">Get In Touch</h4>
            <div className="space-y-2">
              <p className="text-neutral-400 text-sm">Ready to transform your CRM and AI stack?</p>
              <ScheduleCallButton variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; {currentYear} BKT Advisory. All rights reserved.
          </p>
          <p className="text-neutral-500 text-sm">
            John "JB" Burkhardt &middot; Salesforce & AI Systems Architect
          </p>
        </div>
      </div>
    </footer>
  );
}