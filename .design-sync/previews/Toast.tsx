import { Toast } from '@depot/web';

export const Success = () => (
  <Toast
    toast={{
      id: 'toast-success',
      type: 'success',
      title: 'Roster saved',
      message: 'Strike Force Cassius (1,995 / 2,000 pts) saved to your collection.',
      duration: 5000
    }}
    onRemove={() => {}}
  />
);

export const Error = () => (
  <Toast
    toast={{
      id: 'toast-error',
      type: 'error',
      title: 'Failed to load data',
      message: 'Wahapedia data could not be refreshed. Check your connection.',
      duration: 5000
    }}
    onRemove={() => {}}
  />
);

export const Warning = () => (
  <Toast
    toast={{
      id: 'toast-warning',
      type: 'warning',
      title: 'Over points limit',
      message: 'Your roster exceeds the 2,000 pt limit by 45 points.',
      duration: 5000
    }}
    onRemove={() => {}}
  />
);

export const Info = () => (
  <Toast
    toast={{
      id: 'toast-info',
      type: 'info',
      title: 'Offline ready',
      message: 'Adeptus Astartes datasheets are now cached for offline use.',
      duration: 5000
    }}
    onRemove={() => {}}
  />
);

export const TitleOnly = () => (
  <Toast
    toast={{
      id: 'toast-title-only',
      type: 'success',
      title: 'Unit added to roster'
    }}
    onRemove={() => {}}
  />
);
