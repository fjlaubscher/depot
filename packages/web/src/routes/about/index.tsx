import AppLayout from '@/components/layout';
import { PageHeader } from '@/components/ui';

const About = () => (
  <AppLayout title="About depot">
    <div className="flex flex-col gap-2">
      <PageHeader
        title="About depot"
        subtitle="An offline-first roster companion built for hobby tinkering"
      />

      <blockquote className="rounded-md border border-primary-500/40 bg-gray-50 p-4 text-sm italic text-gray-800 dark:border-primary-400/40 dark:bg-gray-900/40 dark:text-gray-200">
        I'm Francois — a passionate software engineer, lifelong hobbyist, and believer in free,
        privacy-respecting apps. My first proper army came out of a Catachan Jungle Fighters Battle
        Force back in 4th edition, and I've been tinkering with tools for the grimdark ever since.
        depot exists because I wanted to keep my tech skills sharp by experimenting with new web
        technologies in an app I actually use every day instead of churning out yet another loud,
        data-hungry product. It runs as a PWA so I can sketch lists on a desktop or a phone, stay
        offline, and keep the experience feeling calm.
      </blockquote>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">What depot is</h2>
        <p className="text-sm text-body">
          depot is a free, open-source list companion that treats speed and offline resilience as
          headline features. It mirrors Wahapedia exports, keeps everything cached on your device,
          and wraps it all in a touch-friendly interface meant for busy game tables and late-night
          list brewing. It ships as a web app only—no app-store builds—and stays free and
          non-commercial. There are no logins, ads, or social feeds-just useful tools and a bit of
          playful polish for people who love tinkering with armies.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">What depot focuses on</h2>
        <ul className="list-disc list-inside text-sm text-body">
          <li>Fast datasheet browsing with sensible filters and typography tuned for phones.</li>
          <li>Lightweight roster sketching so you can tweak points and detachments on the fly.</li>
          <li>
            Offline-first caching that keeps your data available on trains, planes, or spotty Wi-Fi.
          </li>
          <li>
            Transparency: open-source code, Wahapedia-powered data, and no extractive telemetry.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Contributing</h2>
        <p className="text-sm text-body">
          depot lives on spare-evening energy, so thoughtful bug reports and gentle quality-of-life
          suggestions are incredibly helpful. Please share repro steps, device details, or mockups
          whenever you can. Pull requests are welcome—just follow the repo guidelines to keep
          changes tidy and accessible.
        </p>
        <div className="flex flex-col gap-2 text-sm text-body">
          <a
            href="https://github.com/fjlaubscher/depot/issues/new/choose"
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            Create an issue or feature request
          </a>
          <a
            href="https://github.com/fjlaubscher/depot"
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            View the GitHub repository
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">Credits &amp; Legal</h2>
        <p className="text-sm text-body">
          depot is not affiliated with, endorsed by, or sponsored by Games Workshop Limited. All
          related names, imagery, and trademarks remain the property of their respective owners.
          Please support the official publications whenever you can.
        </p>
        <p className="text-sm text-body">
          The data pipeline is powered by Wahapedia exports. Wahapedia is unaffiliated with Games
          Workshop and unaffiliated with depot; we simply transform its public CSVs into offline
          JSON for personal use.
        </p>
        <p className="text-sm text-body">
          If you hold rights to any material referenced in depot and have concerns, email{' '}
          <a
            className="text-primary-600 dark:text-primary-400 underline"
            href="mailto:francoisjlaubscher@gmail.com"
          >
            francoisjlaubscher@gmail.com
          </a>
          , and I'll respond quickly.
        </p>
      </section>
    </div>
  </AppLayout>
);

export default About;
