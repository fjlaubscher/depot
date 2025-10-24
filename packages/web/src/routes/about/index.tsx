import AppLayout from '@/components/layout';
import { PageHeader } from '@/components/ui';

const About = () => (
  <AppLayout title="About depot">
    <div className="flex flex-col gap-2">
      <PageHeader title="About depot" subtitle="Notes on a hobby project for the 41st millennium" />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Why depot exists</h2>
        <blockquote className="rounded-md border border-primary-500/40 bg-gray-50 p-4 text-sm italic text-gray-800 dark:border-primary-400/40 dark:bg-gray-900/40 dark:text-gray-200">
          I'm Francois, a software engineer who never really left the grimdark. depot started as a
          weekend experiment so I could plan games without juggling spreadsheets, ads, or logins. It
          kept growing because friends wanted the same thing. My aim is still modest: keep the data
          accurate, keep the interface kind, and keep privacy intact. I still remember cracking open
          the Catachan Jungle Fighters Battle Force from 4th edition, and I try to ship updates with
          that same excitement.
        </blockquote>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          What depot tries to do
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
          <li>Let you sketch and tweak rosters without losing track of points or wargear.</li>
          <li>Make Wahapedia datasheets easy to browse on a phone during game night.</li>
          <li>Keep working when you are travelling or the venue Wi-Fi drops out.</li>
          <li>Stay open-source so you can inspect, fork, or suggest improvements whenever.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contributing</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          depot lives on spare-evening energy, so thoughtful bug reports and playtest notes go a
          long way. If something feels rough or you have a gentle quality-of-life idea, please open
          an issue and share how you bumped into it. Pull requests are welcome too—the repository
          docs outline the patterns that keep things tidy.
        </p>
        <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
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
    </div>
  </AppLayout>
);

export default About;
