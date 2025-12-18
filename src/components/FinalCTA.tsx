import { Calendar, Mail, Linkedin, ArrowRight } from 'lucide-react';

export function FinalCTA({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <section id="contact" className="bg-gradient-to-br from-blue-600 to-blue-700 py-20 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-white">
              Ready to Build a Predictable Growth Engine?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Book a 30-minute strategy call to discuss your Salesforce and AI stack. 
              We'll assess your current setup, identify quick wins, and outline a roadmap 
              for turning your CRM and AI investments into measurable growth.
            </p>
          </div>

          {/* Primary CTA */}
          <div>
            <button 
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-xl"
            >
              <Calendar size={20} />
              Book Strategy Call
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Contact Options */}
          <div className="pt-8 border-t border-blue-500">
            <p className="text-sm text-blue-100 mb-4">Or reach out directly:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:john@bktadvisory.com" 
                className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
              >
                <Mail size={18} />
                <span>john@bktadvisory.com</span>
              </a>
              <span className="hidden sm:inline text-blue-400">•</span>
              <a 
                href="https://linkedin.com/in/johnburkhardt" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
              >
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
