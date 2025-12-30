import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation({ 
  onNavigateToEstimator, 
  onOpenBooking 
}: { 
  onNavigateToEstimator: () => void;
  onOpenBooking: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div>
            <a href="#home" className="text-neutral-900 text-[24px]">BKT Advisory</a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('work')} className="text-neutral-600 hover:text-neutral-900 transition-colors">
              Work
            </button>
            <button onClick={() => scrollToSection('services')} className="text-neutral-600 hover:text-neutral-900 transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('process')} className="text-neutral-600 hover:text-neutral-900 transition-colors">
              Process
            </button>
            <button onClick={() => scrollToSection('about')} className="text-neutral-600 hover:text-neutral-900 transition-colors">
              About
            </button>
            <a href="#estimator" className="text-neutral-600 hover:text-neutral-900 transition-colors">
              Project Estimator
            </a>
            <button onClick={onOpenBooking} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Book Strategy Call
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('work')} className="text-neutral-600 hover:text-neutral-900 transition-colors text-left">
                Work
              </button>
              <button onClick={() => scrollToSection('services')} className="text-neutral-600 hover:text-neutral-900 transition-colors text-left">
                Services
              </button>
              <button onClick={() => scrollToSection('process')} className="text-neutral-600 hover:text-neutral-900 transition-colors text-left">
                Process
              </button>
              <button onClick={() => scrollToSection('about')} className="text-neutral-600 hover:text-neutral-900 transition-colors text-left">
                About
              </button>
              <a href="#estimator" onClick={() => setIsOpen(false)} className="text-neutral-600 hover:text-neutral-900 transition-colors text-left">
                Project Estimator
              </a>
              <button onClick={() => { onOpenBooking(); setIsOpen(false); }} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                Book Strategy Call
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}