import { Alert } from '@depot/web';

export const Info = () => (
  <Alert variant="info" title="Offline ready">
    This faction's datasheets are cached and available without a connection.
  </Alert>
);

export const Success = () => (
  <Alert variant="success" title="Roster saved">
    Strike Force Cassius (1,995 / 2,000 pts) has been saved to your collection.
  </Alert>
);

export const Warning = () => (
  <Alert variant="warning" title="Over points limit">
    Your roster exceeds the 2,000 pt limit by 45 points. Remove a unit to continue.
  </Alert>
);

export const Error = () => (
  <Alert variant="error" title="Failed to load data">
    Wahapedia data could not be refreshed. Check your connection and try again.
  </Alert>
);
