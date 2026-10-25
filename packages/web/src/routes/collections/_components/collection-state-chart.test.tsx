import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { depot } from '@depot/core';
import i18n from '@/i18n';
import { mockDatasheet } from '@/test/mock-data';
import CollectionStateChart from './collection-state-chart';
import CollectionUnitCard from './collection-unit-card';
import { TestWrapper } from '@/test/test-utils';

afterEach(async () => {
  await i18n.changeLanguage('en');
});

it('updates every state label without changing percentages', async () => {
  const unit: depot.CollectionUnit = {
    id: 'unit',
    datasheet: mockDatasheet,
    modelCost: mockDatasheet.modelCosts[0],
    selectedWargear: [],
    state: 'battle-ready'
  };
  render(<CollectionStateChart items={[unit]} />);
  for (const label of ['Sprue', 'Assembled', 'Battle Ready', 'Parade Ready']) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
  await act(() => i18n.changeLanguage('fr'));
  for (const label of ['Sur grappe', 'Assemblé', 'Prêt à jouer', 'Pour Exposition']) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
  expect(screen.getByText('100%')).toBeInTheDocument();
  expect(screen.getAllByText('0%')).toHaveLength(3);
});

it('translates collection card actions and keeps its expansion state', async () => {
  const unit: depot.CollectionUnit = {
    id: 'unit',
    datasheet: mockDatasheet,
    modelCost: mockDatasheet.modelCosts[0],
    selectedWargear: [],
    state: 'parade-ready'
  };
  const duplicate = vi.fn();
  const remove = vi.fn();
  render(
    <CollectionUnitCard
      unit={unit}
      collectionId="c1"
      state={unit.state}
      onDuplicate={duplicate}
      onRemove={remove}
    />,
    { wrapper: TestWrapper }
  );
  fireEvent.click(screen.getByRole('button', { name: 'Expand unit details' }));
  await act(() => i18n.changeLanguage('fr'));
  expect(
    screen.getByRole('button', { name: 'Masquer les détails de l’unité' })
  ).toBeInTheDocument();
  expect(screen.getByText('Pour Exposition')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Dupliquer l’unité' }));
  fireEvent.click(screen.getByRole('button', { name: 'Retirer l’unité de la collection' }));
  expect(duplicate).toHaveBeenCalledWith(unit);
  expect(remove).toHaveBeenCalledWith(unit.id);
});
