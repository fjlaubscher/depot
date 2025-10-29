import AppLayout from '@/components/layout';
import { PageHeader } from '@/components/ui';

const PrivacyPolicy = () => (
  <AppLayout title="Privacy Policy">
    <div className="flex flex-col gap-2">
      <PageHeader
        title="Privacy Policy"
        subtitle="How depot collects, stores, and uses information"
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <p className="text-sm text-body">
          depot is an open-source companion app for Warhammer 40,000. We collect the minimum
          information required to keep the app running smoothly, diagnose unexpected errors, and
          improve overall reliability.
        </p>
        <p className="text-sm text-body">
          You can use depot anonymously. The app does not require accounts, sign-ins, or personal
          details to build and manage rosters.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Application Data</h2>
        <p className="text-sm text-body">
          All list-building data you create — rosters, preferences, and cached faction content — is
          stored locally in your browser using IndexedDB and local storage. None of this information
          is uploaded to depot servers.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Hosting & Analytics</h2>
        <p className="text-sm text-body">
          depot does not use third-party analytics or advertising trackers. We do not collect usage
          metrics beyond the anonymized error reporting described below.
        </p>
        <p className="text-sm text-body">
          The site is hosted on GitHub Pages. GitHub may collect standard server logs (such as IP
          address, user-agent, and timestamps) when you access the site. These logs are managed by
          GitHub and are not shared with depot.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-md font-semibold text-foreground">Error Reporting</h3>
        <p className="text-sm text-body">
          depot uses{' '}
          <a className="underline text-primary-500" href="https://sentry.io" target="_blank">
            Sentry
          </a>{' '}
          to capture unhandled application errors so we can diagnose and fix crashes. Events contain
          stack traces, browser details, and limited context about the error (such as the page it
          occurred on). We do not intentionally include any personally identifiable information in
          these reports, and IP addresses are used only for coarse location and are not stored by
          depot. On Sentry's free plan, events are retained for 90 days before being automatically
          deleted.
        </p>
        <p className="text-sm text-body">
          If you prefer not to send crash reports, block requests to Sentry (for example, using an
          ad blocker or network filter targeting <code>*.ingest.sentry.io</code>). Running depot
          locally without configuring a Sentry DSN also disables error reporting.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-md font-semibold text-foreground">Data Sharing</h3>
        <p className="text-sm text-body">
          We do not sell or share personal information. Any error telemetry collected through Sentry
          is used solely for debugging and is retained only for the period described above.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Updates</h2>
        <p className="text-sm text-body">
          We update this privacy policy when our practices change and adjust the effective date
          accordingly. Material changes are highlighted in release notes or project documentation.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p className="text-sm text-body">
          If you have questions about this policy or would like to request removal of any captured
          error data, email{' '}
          <a
            className="text-primary-600 dark:text-primary-400 underline"
            href="mailto:francoisjlaubscher@gmail.com"
          >
            francoisjlaubscher@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2 text-xs text-subtle">
        <span>Effective date: October 23, 2025</span>
      </section>
    </div>
  </AppLayout>
);

export default PrivacyPolicy;
