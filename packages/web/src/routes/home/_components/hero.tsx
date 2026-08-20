import type { FC } from 'react';

import { getImageUrl } from '@/utils/paths';

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
    <div className="relative z-10 flex flex-col gap-2 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">11th edition is here</h1>
      <p className="max-w-xl text-sm text-white/80 sm:text-base">
        depot has been rebuilt for 11th edition: fresh data, detachment pages and roster legality
        checks.
      </p>
    </div>
  </section>
);

export default Hero;
