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
          depot is a privacy-first, open-source Warhammer 40,000 companion. You can browse factions,
          datasheets, and rosters anonymously: the app never asks for a login, and there are no ad
          networks or third-party beacons watching what you do.
        </p>
        <p className="text-sm text-body">
          Only the minimum technical data required to serve the site or fix crashes is processed,
          and most of that work happens on your own device.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Application data on your device</h2>
        <p className="text-sm text-body">
          Rosters, preferences, cached faction data, and any offline assets live inside your
          browser's IndexedDB and local storage. None of this content is uploaded back to depot or
          shared with third parties. Clearing your browser storage for godepot.dev removes that
          information permanently from your device.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Hosting &amp; server logs</h2>
        <p className="text-sm text-body">
          depot is hosted on Cloudflare Pages. When you request a page, Cloudflare may log standard
          diagnostic details—IP address, user-agent, and timestamps—to keep the network safe. These
          short-lived logs stay inside Cloudflare's infrastructure; depot does not combine them with
          any other data or build user profiles.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Error reporting (Sentry)</h2>
        <p className="text-sm text-body">
          Crash reports are powered by{' '}
          <a
            className="underline text-primary-500"
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sentry
          </a>
          . Error telemetry is only sent when a Sentry DSN is configured in the deployment
          environment; local builds without a DSN never talk to Sentry. Events contain stack traces,
          browser metadata, the route where the error occurred, and coarse IP information (for
          country/region only). On Sentry's free plan, events automatically expire after roughly 90
          days.
        </p>
        <p className="text-sm text-body">
          Sentry is used strictly to debug crashes. No roster data, PII, or gameplay content is
          intentionally included in those payloads. If you'd rather block telemetry completely, use
          an ad blocker or network rule to deny requests to <code>*.ingest.sentry.io</code>.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Analytics &amp; advertising</h2>
        <p className="text-sm text-body">
          depot does not run analytics dashboards, ad networks, social pixels, or fingerprinting
          scripts. If a lightweight, privacy-respecting analytics tool is ever added, this page and
          the release notes will be updated before it ships.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Your choices</h2>
        <ul className="list-disc list-inside text-sm text-body">
          <li>
            To clear app data, open your browser settings for godepot.dev and delete local
            storage/IndexedDB. This removes rosters, cached factions, and offline assets.
          </li>
          <li>
            To block crash reports, deny requests to <code>*.ingest.sentry.io</code> with an ad
            blocker, DNS sinkhole, or firewall.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Updates &amp; contact</h2>
        <p className="text-sm text-body">
          When depot's data practices change, the effective date below will be updated and the
          change will be mentioned in release notes. For questions, takedown requests, or privacy
          concerns, email{' '}
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
        <span>Effective date: November 25, 2025</span>
      </section>
    </div>
  </AppLayout>
);

export default PrivacyPolicy;
