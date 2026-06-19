import { ErrorState } from '@depot/web';

export const Default = () => (
  <ErrorState
    title="Failed to load faction"
    message="We couldn't load the Adeptus Astartes datasheets. Please try again."
    onRetry={() => {}}
  />
);

export const RetryOnly = () => (
  <ErrorState
    title="Roster sync failed"
    message="Your roster changes could not be saved to local storage."
    showHome={false}
    onRetry={() => {}}
  />
);

export const WithStackTrace = () => (
  <ErrorState
    title="Something went wrong"
    message="An unexpected error occurred while parsing the Wahapedia export."
    stackTrace={'TypeError: Cannot read properties of undefined (reading "datasheets")\n    at parseFaction (faction.ts:42)\n    at loadData (loader.ts:18)'}
    onRetry={() => {}}
  />
);
