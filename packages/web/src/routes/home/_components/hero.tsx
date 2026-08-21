import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui';

const Hero: FC = () => (
  <section className="surface-card p-3.5" data-testid="home-hero">
    <h1 className="text-lg leading-tight font-bold text-foreground">Muster your forces</h1>
    <p className="mt-1 text-[12.5px] leading-normal text-muted">
      Everything works offline — rules, rosters, collections.
    </p>
    <nav className="mt-3 flex gap-1" aria-label="Get started" data-testid="hero-links">
      <Link to="/rosters" className={buttonClasses({ fullWidth: true })}>
        Rosters
      </Link>
      <Link to="/factions" className={buttonClasses({ variant: 'secondary', fullWidth: true })}>
        Factions
      </Link>
      <Link to="/collections" className={buttonClasses({ variant: 'secondary', fullWidth: true })}>
        Collections
      </Link>
    </nav>
  </section>
);

export default Hero;
