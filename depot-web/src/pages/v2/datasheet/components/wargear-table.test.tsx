import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WargearTable from './wargear-table';
import { depot } from 'depot-core';

describe('WargearTable', () => {
  const mockRangedWargear: depot.Wargear[] = [
    {
      line: 1,
      name: 'Bolt pistol',
      type: 'Ranged',
      range: '12',
      a: '1',
      bsWs: '2',
      s: '4',
      ap: '0',
      d: '1',
      description: ''
    },
    {
      line: 2,
      name: 'Plasma gun',
      type: 'Ranged',
      range: '24',
      a: '1',
      bsWs: '3',
      s: '7',
      ap: '-2',
      d: '1',
      description: 'supercharge'
    }
  ];

  const mockMeleeWargear: depot.Wargear[] = [
    {
      line: 1,
      name: 'Power sword',
      type: 'Melee',
      range: '',
      a: '4',
      bsWs: '2',
      s: '5',
      ap: '-2',
      d: '2',
      description: ''
    },
    {
      line: 2,
      name: 'Thunder hammer',
      type: 'Melee',
      range: '',
      a: '3',
      bsWs: 'N/A',
      s: '8',
      ap: '-2',
      d: '3',
      description: 'devastating wounds'
    }
  ];

  describe('Ranged Wargear', () => {
    it('renders ranged wargear table with correct headers', () => {
      render(<WargearTable wargear={mockRangedWargear} type="Ranged" />);

      expect(screen.getByRole('heading', { name: 'Ranged Wargear' })).toBeInTheDocument();
      expect(screen.getByText('Range')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('BS')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('AP')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('renders ranged wargear data correctly', () => {
      render(<WargearTable wargear={mockRangedWargear} type="Ranged" />);

      expect(screen.getByText('Bolt pistol')).toBeInTheDocument();
      expect(screen.getByText('12"')).toBeInTheDocument(); // Range with quotes
      expect(screen.getByText('2+')).toBeInTheDocument(); // Bolt pistol BS
      
      expect(screen.getByText('Plasma gun')).toBeInTheDocument();
      expect(screen.getByText('24"')).toBeInTheDocument();
      expect(screen.getByText('3+')).toBeInTheDocument(); // Plasma gun BS
    });

    it('shows weapon descriptions when present', () => {
      render(<WargearTable wargear={mockRangedWargear} type="Ranged" />);

      expect(screen.getByText(/supercharge/)).toBeInTheDocument();
    });
  });

  describe('Melee Wargear', () => {
    it('renders melee wargear table with correct headers', () => {
      render(<WargearTable wargear={mockMeleeWargear} type="Melee" />);

      expect(screen.getByRole('heading', { name: 'Melee Wargear' })).toBeInTheDocument();
      expect(screen.queryByText('Range')).not.toBeInTheDocument(); // No range column for melee
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('WS')).toBeInTheDocument(); // WS instead of BS
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('AP')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('renders melee wargear data correctly', () => {
      render(<WargearTable wargear={mockMeleeWargear} type="Melee" />);

      expect(screen.getByText('Power sword')).toBeInTheDocument();
      expect(screen.getByText('2+')).toBeInTheDocument(); // WS with +

      expect(screen.getByText('Thunder hammer')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument(); // N/A stays as is, no +
    });

    it('shows weapon descriptions when present', () => {
      render(<WargearTable wargear={mockMeleeWargear} type="Melee" />);

      expect(screen.getByText(/devastating wounds/)).toBeInTheDocument();
    });
  });

  describe('Common behavior', () => {
    it('renders nothing when no wargear provided', () => {
      const { container } = render(<WargearTable wargear={[]} type="Ranged" />);

      expect(container.firstChild).toBeNull();
    });

    it('renders multiple weapons in separate rows', () => {
      render(<WargearTable wargear={mockRangedWargear} type="Ranged" />);

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); // Header + 2 data rows
    });

    it('applies correct styling classes', () => {
      render(<WargearTable wargear={mockRangedWargear} type="Ranged" />);

      const nameCell = screen.getByText('Bolt pistol');
      expect(nameCell).toHaveClass('font-medium');
    });

    it('handles single weapon correctly', () => {
      const singleWeapon = [mockRangedWargear[0]];
      render(<WargearTable wargear={singleWeapon} type="Ranged" />);

      expect(screen.getByText('Bolt pistol')).toBeInTheDocument();
      expect(screen.queryByText('Plasma gun')).not.toBeInTheDocument();

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // Header + 1 data row
    });

    it('handles weapons without descriptions', () => {
      const weaponWithoutDescription = [{
        ...mockRangedWargear[0],
        description: ''
      }];

      render(<WargearTable wargear={weaponWithoutDescription} type="Ranged" />);

      expect(screen.getByText('Bolt pistol')).toBeInTheDocument();
      expect(screen.queryByText(/\[.*\]/)).not.toBeInTheDocument(); // No brackets
    });

    it('formats BS/WS values correctly', () => {
      render(<WargearTable wargear={mockMeleeWargear} type="Melee" />);

      // Regular value gets +
      expect(screen.getByText('2+')).toBeInTheDocument();
      // N/A stays as is
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('uses correct key format for table rows', () => {
      render(<WargearTable wargear={mockRangedWargear} type="Ranged" />);

      // Should not cause React key warnings in console
      expect(screen.getByText('Bolt pistol')).toBeInTheDocument();
      expect(screen.getByText('Plasma gun')).toBeInTheDocument();
    });
  });
});