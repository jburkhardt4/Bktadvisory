import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from 'figma:asset/57dd7c63486eb8c4e2ccbec3103b44016b4be359.png';

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
    <nav className="sticky top-0 z-50 bg-[#EFF6FF]/90 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[116px]">
          {/* Logo */}
          <div className="py-4">
            <a href="#home" className="block" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logo} alt="BKT Advisory Logo" className="h-[113px] w-auto" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('work')} className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Work
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button onClick={() => scrollToSection('services')} className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Services
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button onClick={() => scrollToSection('process')} className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Process
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button onClick={() => scrollToSection('about')} className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </button>
            <a href="#estimator" className="text-slate-900 hover:text-blue-700 transition-colors relative group">
              Project Estimator
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-700 group-hover:w-full transition-all duration-300"></span>
            </a>
            <button onClick={onOpenBooking} className="px-8 py-3.5 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-[0_0_30px_rgba(29,78,216,0.5)]">
              Book Strategy Call
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-900 hover:text-slate-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-blue-100">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('work')} className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Work
              </button>
              <button onClick={() => scrollToSection('services')} className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Services
              </button>
              <button onClick={() => scrollToSection('process')} className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Process
              </button>
              <button onClick={() => scrollToSection('about')} className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                About
              </button>
              <a href="#estimator" onClick={() => setIsOpen(false)} className="text-slate-900 hover:text-blue-700 transition-colors text-left">
                Project Estimator
              </a>
              <button onClick={() => { onOpenBooking(); setIsOpen(false); }} className="px-8 py-3.5 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors text-center">
                Book Strategy Call
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}