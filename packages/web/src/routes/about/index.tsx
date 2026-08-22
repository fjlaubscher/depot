import AppLayout from '@/components/layout';
import AppVersion from '@/components/shared/app-version';

const About = () => (
  <AppLayout title="About depot">
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About depot</h1>
        <p className="mt-0.5 text-sm text-muted">
          An offline-first roster companion built for hobby tinkering
        </p>
        <AppVersion className="mt-1" />
      </div>

      <blockquote className="rounded-sm border-l-2 border-border-accent bg-surface-muted p-4 text-sm italic text-body">
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
          A free, open-source list companion built around fast datasheet browsing, lightweight
          roster sketching, and typography tuned for phones. It mirrors Wahapedia exports and caches
          everything on your device, so it keeps working on trains, planes, or spotty Wi-Fi. Web app
          only—no app-store builds, no logins, no ads.
        </p>
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
            className="text-accent underline"
          >
            Create an issue or feature request
          </a>
          <a
            href="https://github.com/fjlaubscher/depot"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            View the GitHub repository
          </a>
          <a
            href="https://x.com/fjlaubscher"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            Say hi on X (@fjlaubscher)
          </a>
        </div>
        <p className="text-sm text-body">
          GitHub issues are the best place for bugs and requests. For anything else, X is the way to
          reach me.
        </p>
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
          <a className="text-accent underline" href="mailto:francoisjlaubscher@gmail.com">
            francoisjlaubscher@gmail.com
          </a>
          , and I'll respond quickly.
        </p>
      </section>
    </div>
  </AppLayout>
);

export default About;
