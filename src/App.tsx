import { MotionConfig } from 'motion/react';
import CourseCatalog from './components/CourseCatalog';
import CurriculumOverview from './components/CurriculumOverview';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import KiwifySecuritySection, { KiwifyFaqSection } from './components/KiwifySecuritySection';
import Navbar from './components/Navbar';
import NeuralBrainCanvas from './components/NeuralBrainCanvas';
import PromptsMarketplace from './components/PromptsMarketplace';
import { FLAGSHIP_COURSE } from './data/courses';
import { smoothScrollToId, useSmoothScroll } from './utils/smoothScroll';

export default function App() {
  useSmoothScroll();

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen text-zinc-100">
        {/* Fixed scroll-choreographed 3D Brain -> Starfield cosmic canvas */}
        <NeuralBrainCanvas />

        <div className="relative z-10">
          <Navbar />

          <main>
            <HeroSection onExploreCourses={() => smoothScrollToId('cursos')} />
            <CurriculumOverview onSelectTrackFilter={() => smoothScrollToId('cursos')} />
            <KiwifySecuritySection />
            <CourseCatalog course={FLAGSHIP_COURSE} />
            <PromptsMarketplace />
            <KiwifyFaqSection />
          </main>

          <Footer />
        </div>
      </div>
    </MotionConfig>
  );
}
