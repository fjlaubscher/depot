import type { FC } from 'react';

import { getImageUrl } from '@/utils/paths';

/**
 * Announcement banner, not a launcher — the bottom bar and rail already carry
 * navigation, so repeating it here would just be a second nav.
 */
const Hero: FC = () => (
  <section
    className="relative overflow-hidden rounded-sm border border-border-subtle"
    data-testid="home-hero"
  >
    <img
      src={getImageUrl('depot-hero.jpg')}
      alt=""
      className="absolute inset-0 size-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/75 to-accent-900/60" />

    <div className="relative flex flex-col gap-1 p-4">
      <p className="font-mono text-[10px] leading-none font-bold uppercase tracking-widest text-accent-300">
        // Now in 11th edition
      </p>
      <h1 className="text-lg leading-tight font-bold text-white">depot has a new look</h1>
      <p className="max-w-[46ch] text-[12.5px] leading-normal text-white/75">
        Rebuilt for reading rules at the table — denser, faster, and still fully offline. Crusade
        features are on the way.
      </p>
    </div>
  </section>
);

export default Hero;
