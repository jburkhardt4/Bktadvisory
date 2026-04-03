// React import not needed with JSX transform
import { motion } from 'motion/react';

interface EstimatorStepperProps {
  currentStep: number; // 1-based index
  totalSteps: number;
  steps: { num: number; label: string }[];
}

export function EstimatorStepper({ currentStep, totalSteps: _totalSteps, steps }: EstimatorStepperProps) {
  // Mobile Carousel Logic
  // Each item is 33.33% width of the container.
  // We want the active item to be centered (i.e., in the second slot of the 3 visible slots).
  // Translate calculation: (1 - (currentStep - 1)) * 33.333%
  // Explanation:
  // Step 1 (Index 0): Shift right by 1 unit (33.33%) -> Position 1 (Center)
  // Step 2 (Index 1): Shift 0 -> Position 1 (Center) matches natural flow (0, 1, 2)
  // Step 3 (Index 2): Shift left by 1 unit (-33.33%) -> Position 1 (Center)
  const mobileTranslateX = `${(1 - (currentStep - 1)) * 33.333}%`;

  return (
    <div className="w-full border-b border-slate-800 bg-[#fffffff2]">
      
      {/* DESKTOP LAYOUT (md+) */}
      <div className="hidden md:flex max-w-[1440px] mx-auto items-center justify-between px-[36px] py-[26px] mx-[250px]">
        {steps.map((step, index) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const isLast = index === steps.length - 1;

          // Styling logic
          let circleClasses = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2 ";
          let labelClasses = "mt-2 whitespace-nowrap text-xs font-semibold tracking-wide transition-colors duration-300 ";
          
          if (isActive || isCompleted) {
            // Active or Completed: Royal Blue styling
            circleClasses += "bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]";
            // Label text matches the primary royal blue
            labelClasses += "text-blue-600";
          } else {
            // Upcoming Steps styling
            // Circle Fill: #F8FAFC, Circle Border: #0F172B, Number/Text inside: #0F172B
            circleClasses += "bg-[#F8FAFC] border-[#0F172B] text-[#0F172B]";
            labelClasses += "text-slate-500";
          }

          return [
            /* Step Indicator — circle + label in normal flow (like mobile) */
            <div key={`indicator-${step.num}`} className="flex flex-col items-center justify-center z-10 flex-none">
              <div className={circleClasses}>
                {isCompleted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className={labelClasses}>
                {step.label}
              </span>
            </div>,

            /* Connector Line — translate up to align with circle center */
            !isLast && (
              <div key={`line-${step.num}`} className="flex-1 mx-4 h-[2px] -translate-y-[12px] bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )
          ];
        })}
      </div>

      {/* MOBILE LAYOUT (< md) — height reduced 30% from h-28 (112px) to ~78px */}
      <div className="md:hidden h-[78px] relative overflow-hidden flex items-center bg-white/95 bg-[#ffffffeb]">
        {/* Gradient Masks - Updated to fade to white */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        <motion.div 
          className="flex w-full absolute left-0"
          initial={false}
          animate={{ x: mobileTranslateX }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} // Cubic-bezier from requirements
        >
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            const distance = Math.abs(currentStep - step.num);
            const isNeighbor = distance === 1;
            
            // Opacity Logic: Active=1, Neighbor=0.3 (30% opacity), Others=0
            let opacity = 0;
            if (isActive) opacity = 1;
            else if (isNeighbor) opacity = 0.3;

            // Apply consistent styling to mobile bubbles as well
            let circleClasses = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-colors duration-300 border-2 ";
            let labelClasses = "text-[10px] font-semibold tracking-tight text-center px-1 leading-tight ";
            
            if (isActive || isCompleted) {
              circleClasses += "bg-blue-600 border-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]";
              labelClasses += "text-blue-600";
            } else {
              // Upcoming styling
              circleClasses += "bg-[#F8FAFC] border-[#0F172B] text-[#0F172B]";
              labelClasses += "text-slate-500";
            }

            return (
              <div 
                key={step.num} 
                className="flex-shrink-0 w-[33.333%] flex flex-col items-center justify-center transition-all duration-400"
                style={{ 
                  opacity,
                  transform: isActive ? 'scale(1)' : 'scale(0.85)',
                }}
              >
                <div className={circleClasses}>
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span className={labelClasses}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}