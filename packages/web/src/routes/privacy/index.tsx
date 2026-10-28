import AppLayout from '@/components/layout';
import { Trans, useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation('pages');
  return (
    <AppLayout title={t('privacy.title')}>
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('privacy.title')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('privacy.subtitle')}</p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.overviewTitle')}</h2>
          <p className="text-sm text-body">{t('privacy.overview')}</p>
          <p className="text-sm text-body">{t('privacy.minimum')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.deviceTitle')}</h2>
          <p className="text-sm text-body">{t('privacy.device')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.hostingTitle')}</h2>
          <p className="text-sm text-body">{t('privacy.hosting')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.errorsTitle')}</h2>
          <p className="text-sm text-body">
            <Trans
              ns="pages"
              i18nKey="privacy.errors"
              components={{
                sentry: (
                  <a
                    className="underline text-accent-500"
                    href="https://sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                )
              }}
            />
          </p>
          <p className="text-sm text-body">{t('privacy.errorPurpose')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.analyticsTitle')}</h2>
          <p className="text-sm text-body">{t('privacy.analytics')}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.choicesTitle')}</h2>
          <ul className="list-disc list-inside text-sm text-body">
            <li>{t('privacy.clear')}</li>
            <li>
              <Trans ns="pages" i18nKey="privacy.block" components={{ domain: <code /> }} />
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">{t('privacy.updatesTitle')}</h2>
          <p className="text-sm text-body">
            <Trans
              ns="pages"
              i18nKey="privacy.updates"
              components={{
                email: (
                  <a className="text-accent underline" href="mailto:francoisjlaubscher@gmail.com" />
                )
              }}
            />
          </p>
        </section>

        <section className="flex flex-col gap-2 text-xs text-subtle">
          <span>{t('privacy.effectiveDate')}</span>
        </section>
      </div>
    </AppLayout>
  );
};

export default PrivacyPolicy;
