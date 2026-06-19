import { Loader } from '@depot/web';

export const Default = () => <Loader />;

export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <Loader size="sm" />
    <Loader size="md" />
    <Loader size="lg" />
  </div>
);

export const PrimaryColor = () => <Loader size="lg" color="primary" />;

export const SecondaryColor = () => <Loader size="lg" color="secondary" />;

export const OnDarkSurface = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#1f2937',
      borderRadius: '0.5rem'
    }}
  >
    <Loader size="lg" color="white" />
  </div>
);
