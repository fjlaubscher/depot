import { act, render, screen } from '@testing-library/react';
import type { depot } from '@depot/core';
import i18n from '@/i18n';

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
  it('switches characteristic abbreviations without changing model data', async () => {
    const model = createModel({ invSv: '4', invSvDescr: 'Ranged attacks only' });
    const { container } = render(<ModelStatsRow model={model} />);
    const labels = () =>
      [...container.querySelectorAll('.stat-cell .type-label')].map((el) => el.textContent);
    const values = () =>
      [...container.querySelectorAll('.stat-cell .type-stat')].map((el) => el.textContent);
    const originalValues = values();
    expect(labels()).toEqual(['M', 'T', 'Sv', 'W', 'Ld', 'OC']);

    await act(() => i18n.changeLanguage('fr'));
    expect(labels()).toEqual(['M', 'E', 'Sv', 'PV', 'Cd', 'OC']);
    expect(values()).toEqual(originalValues);
    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByTestId('model-invulnerable-save')).toHaveTextContent(
      'Sauvegarde invulnérable 4+'
    );
    expect(screen.getByTestId('model-invulnerable-save-description')).toHaveTextContent(
      'Ranged attacks only'
    );

    await act(() => i18n.changeLanguage('en'));
    expect(labels()).toEqual(['M', 'T', 'Sv', 'W', 'Ld', 'OC']);
  });

  it('renders invulnerable save info when present', () => {
    const model = createModel({ invSv: '4', invSvDescr: 'Ranged attacks only' });
    render(<ModelStatsRow model={model} />);

    expect(screen.getByTestId('model-invulnerable-save')).toHaveTextContent('Invulnerable Save 4+');
    expect(screen.getByTestId('model-invulnerable-save-description')).toHaveTextContent(
      'Ranged attacks only'
    );
  });

  it('does not render invulnerable section when not available', () => {
    const model = createModel({ invSv: '-' });
    render(<ModelStatsRow model={model} />);

    expect(screen.queryByTestId('model-invulnerable-save')).not.toBeInTheDocument();
  });
});
