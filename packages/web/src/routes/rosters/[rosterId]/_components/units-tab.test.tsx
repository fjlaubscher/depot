import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnitsTab from './units-tab';
import { TestWrapper } from '@/test/test-utils';
import { createMockDatasheet, createMockRoster, createMockRosterUnit } from '@/test/mock-data';

describe('UnitsTab', () => {
  it('renders a flat name-sorted list without role sections', () => {
    const units = [
      createMockRosterUnit({
        id: 'b',
        datasheet: createMockDatasheet({ slug: 'boyz', name: 'Boyz' })
      }),
      createMockRosterUnit({
        id: 'a',
        datasheet: createMockDatasheet({ slug: 'captain', name: 'Captain' })
      })
    ];

    render(
      <TestWrapper>
        <UnitsTab roster={createMockRoster({ units })} />
      </TestWrapper>
    );

    expect(screen.getByTestId('units-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-role-section')).not.toBeInTheDocument();

    const names = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(names).toContain('Boyz');
    expect(names).toContain('Captain');
    expect(names.indexOf('Boyz')).toBeLessThan(names.indexOf('Captain'));
  });

  it('flags the warlord, its enhancement and any unit-scoped legality issue', () => {
    const unit = createMockRosterUnit({
      id: 'a',
      datasheet: createMockDatasheet({ slug: 'captain', name: 'Captain' })
    });
    const roster = createMockRoster({
      units: [unit],
      warlordUnitId: 'a',
      enhancements: [{ enhancement: { name: 'Adept of the Codex' } as never, unitId: 'a' }]
    });

    render(
      <TestWrapper>
        <UnitsTab roster={roster} />
      </TestWrapper>
    );

    expect(screen.getByTestId('unit-warlord-tag')).toBeInTheDocument();
    expect(screen.getByTestId('unit-enhancement-tag')).toHaveTextContent('Adept of the Codex');
  });
});
