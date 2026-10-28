import type { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { getImageUrl } from '@/utils/paths';

/**
 * Announcement banner, not a launcher — the bottom bar and rail already carry
 * navigation, so repeating it here would just be a second nav.
 */
const Hero: FC = () => {
  const { t } = useTranslation('home');
  return (
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
          {t('hero.edition')}
        </p>
        <h1 className="text-lg leading-tight font-bold text-white">{t('hero.title')}</h1>
        <p className="max-w-[46ch] text-[12.5px] leading-normal text-white/75">
          <Trans
            ns="home"
            i18nKey="hero.description"
            components={{
              repo: (
                <a
                  className="text-white underline decoration-white/50 underline-offset-2"
                  href="https://github.com/fjlaubscher/depot"
                  target="_blank"
                  rel="noreferrer"
                />
              )
            }}
          />
        </p>
      </div>
    </section>
  );
};

export default Hero;
