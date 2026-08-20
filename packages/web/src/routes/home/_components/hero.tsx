import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Boxes, ClipboardList } from 'lucide-react';

import { getImageUrl } from '@/utils/paths';

const LINKS = [
  { to: '/factions', label: 'Factions', icon: BookOpen },
  { to: '/collections', label: 'Collections', icon: Boxes },
  { to: '/rosters', label: 'Rosters', icon: ClipboardList }
];

const Hero: FC = () => (
  <section
    className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg dark:border-gray-800"
    data-testid="home-hero"
  >
    <img
      src={getImageUrl('depot-hero.jpg')}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-gray-900/75 to-primary-950/60" />
    <div className="relative z-10 flex flex-col gap-4 p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">11th edition is here</h1>
        <p className="text-sm text-white/80 sm:text-base">
          Rules, collections and rosters — all offline.
        </p>
      </div>
      <nav className="grid grid-cols-3 gap-2" aria-label="Get started" data-testid="hero-links">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2 py-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-ring-primary sm:flex-row sm:justify-center"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  </section>
);

export default Hero;
