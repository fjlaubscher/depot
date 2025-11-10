import { render, screen } from '@testing-library/react';
import type { depot } from '@depot/core';

import ModelStatsRow from './model-stats-row';

const createModel = (overrides: Partial<depot.Model> = {}): depot.Model => ({
  datasheetId: 'test',
  line: '1',
  name: 'Test Model',
  m: '6"',
  t: '4',
  sv: '3+',
  invSv: '-',
  invSvDescr: '',
  w: '3',
  ld: '6+',
  oc: '1',
  baseSize: '32mm',
  baseSizeDescr: '',
  ...overrides
});

describe('ModelStatsRow', () => {
  it('renders invulnerable save info when present', () => {
    const model = createModel({ invSv: '4', invSvDescr: 'Ranged attacks only' });
    render(<ModelStatsRow model={model} />);

    expect(screen.getByTestId('model-invulnerable-save')).toHaveTextContent('Invulnerable Save 4+');
    expect(screen.getByText(/\(Ranged attacks only\)/i)).toBeInTheDocument();
  });

  it('does not render invulnerable section when not available', () => {
    const model = createModel({ invSv: '-' });
    render(<ModelStatsRow model={model} />);

    expect(screen.queryByTestId('model-invulnerable-save')).not.toBeInTheDocument();
  });
});
