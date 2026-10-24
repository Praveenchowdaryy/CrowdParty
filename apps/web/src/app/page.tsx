import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedGames } from '@/components/home/FeaturedGames';
import { HowItWorks } from '@/components/home/HowItWorks';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedGames />
      <HowItWorks />
    </div>
  );
}
