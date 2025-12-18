export function Footer({ onOpenBooking }: { onOpenBooking: () => void }) {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 pb-8 border-b border-neutral-800">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-white">BKT Advisory</h3>
            <p className="text-neutral-400 text-sm">
              Building predictable growth engines via Salesforce & AI for Startups, FinTech, and InsurTech.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white text-sm uppercase tracking-wide">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <button onClick={() => scrollToSection('work')} className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                Selected Work
              </button>
              <button onClick={() => scrollToSection('services')} className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                Services
              </button>
              <button onClick={() => scrollToSection('process')} className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                Process
              </button>
              <button onClick={() => scrollToSection('about')} className="text-neutral-400 hover:text-white transition-colors text-left text-sm">
                About
              </button>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white text-sm uppercase tracking-wide">Get In Touch</h4>
            <div className="space-y-2">
              <p className="text-neutral-400 text-sm">Ready to transform your CRM and AI stack?</p>
              <button 
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Book Strategy Call
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            © {currentYear} BKT Advisory. All rights reserved.
          </p>
          <p className="text-neutral-500 text-sm">
            John "JB" Burkhardt · Salesforce & AI Systems Architect
          </p>
        </div>
      </div>
    </footer>
  );
}
