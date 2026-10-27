import AppLayout from '@/components/layout';
import AppVersion from '@/components/shared/app-version';
import { Trans, useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation('pages');
  return (
    <AppLayout title={t('about.title')}>
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('about.title')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('about.subtitle')}</p>
          <AppVersion className="mt-1" />
        </div>

        <blockquote className="rounded-sm border-l-2 border-border-accent bg-surface-muted p-4 text-sm italic text-body">
          {t('about.author')}
        </blockquote>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('about.whatTitle')}</h2>
          <p className="text-sm text-body">{t('about.what')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('about.contributingTitle')}</h2>
          <p className="text-sm text-body">{t('about.contributing')}</p>
          <div className="flex flex-col gap-2 text-sm text-body">
            <a
              href="https://github.com/fjlaubscher/depot/issues/new/choose"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              {t('about.issue')}
            </a>
            <a
              href="https://github.com/fjlaubscher/depot"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              {t('about.repository')}
            </a>
            <a
              href="https://x.com/fjlaubscher"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              {t('about.social')}
            </a>
          </div>
          <p className="text-sm text-body">{t('about.contact')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('about.legalTitle')}</h2>
          <p className="text-sm text-body">{t('about.legal')}</p>
          <p className="text-sm text-body">{t('about.data')}</p>
          <p className="text-sm text-body">
            <Trans
              ns="pages"
              i18nKey="about.rights"
              components={{
                email: (
                  <a className="text-accent underline" href="mailto:francoisjlaubscher@gmail.com" />
                )
              }}
            />
          </p>
        </section>
      </div>
    </AppLayout>
  );
};

export default About;
