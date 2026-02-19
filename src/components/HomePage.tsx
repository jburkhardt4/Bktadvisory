import { Hero } from './Hero';
import { StatsBar } from './StatsBar';
import { ServicesGrid } from './ServicesGrid';
import { SelectedWork } from './SelectedWork';
import { Process } from './Process';
import { About } from './About';
import { FinalCTA } from './FinalCTA';
import { Reviews } from './Reviews';
import { EstimatorCTA } from './EstimatorCTA';

export function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <div id="services">
        <ServicesGrid />
      </div>
      <div id="work">
        <SelectedWork />
      </div>
      <EstimatorCTA />
      <Reviews compact />
      <div id="process">
        <Process />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="contact">
        <FinalCTA />
      </div>
    </>
  );
}