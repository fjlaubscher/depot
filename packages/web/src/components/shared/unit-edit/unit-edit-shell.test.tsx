import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { TestWrapper } from '@/test/test-utils';
import { createMockDatasheet, createMockRosterUnit, mockWargearAbility } from '@/test/mock-data';
import UnitEditShell from './unit-edit-shell';

describe('UnitEditShell translations', () => {
  it('preserves selections and source cost labels when switching language in a collection editor', async () => {
    const datasheet = createMockDatasheet();
    const extraCost = {
      ...datasheet.modelCosts[0],
      line: 'extra',
      description: '10 models',
      cost: '160'
    };
    const unit = createMockRosterUnit({
      datasheet: {
        ...datasheet,
        modelCosts: [datasheet.modelCosts[0], extraCost],
        abilities: [...datasheet.abilities, mockWargearAbility]
      },
      selectedWargear: [],
      selectedWargearAbilities: []
    });
    const save = vi.fn();
    render(
      <UnitEditShell
        unit={unit}
        testId="collection-editor"
        backTo="/collections/one"
        backLabel="Ma collection"
        documentTitle="Ma collection"
        title={datasheet.name}
        onSave={save}
      />,
      { wrapper: TestWrapper }
    );
    fireEvent.change(screen.getByLabelText('Unit size'), { target: { value: 'extra' } });
    fireEvent.click(screen.getByTestId(`wargear-pill-${datasheet.wargear[0].id}`));
    fireEvent.click(screen.getByRole('button', { name: mockWargearAbility.name }));
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByLabelText('Effectif')).toHaveValue('extra');
    expect(screen.getByTestId('unit-edit-points')).toHaveTextContent('+80 PTS');
    expect(screen.getByTestId(`wargear-pill-${datasheet.wargear[0].id}`)).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: mockWargearAbility.name })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByText('10 models (160 pts)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }));
    expect(save).toHaveBeenCalledWith({
      selectedModelCost: extraCost,
      selectedWargear: [datasheet.wargear[0]],
      selectedWargearAbilities: [mockWargearAbility]
    });
  });

  it('translates unchanged points and empty wargear', async () => {
    await i18n.changeLanguage('fr');
    const unit = createMockRosterUnit({ datasheet: createMockDatasheet({ wargear: [] }) });
    render(
      <UnitEditShell
        unit={unit}
        testId="editor"
        backTo="/collections/one"
        backLabel="Ma collection"
        documentTitle="Ma collection"
        title={unit.datasheet.name}
        onSave={vi.fn()}
      />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByTestId('unit-edit-points')).toHaveTextContent('AUCUN CHANGEMENT');
    expect(screen.getByTestId('no-wargear-available')).toHaveTextContent(
      'Aucun équipement disponible pour cette unité.'
    );
  });
});
