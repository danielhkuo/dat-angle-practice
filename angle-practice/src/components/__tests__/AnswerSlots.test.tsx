import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnswerSlots } from '../AnswerSlots';
import { Angle } from '@/types';

const mockAngles: Angle[] = [
  {
    id: 'angle-1',
    degrees: 30,
    rotation: 0,
    armLength1: 100,
    armLength2: 120,
  },
  {
    id: 'angle-2',
    degrees: 45,
    rotation: 90,
    armLength1: 110,
    armLength2: 100,
  },
  {
    id: 'angle-3',
    degrees: 60,
    rotation: 180,
    armLength1: 120,
    armLength2: 110,
  },
  {
    id: 'angle-4',
    degrees: 75,
    rotation: 270,
    armLength1: 100,
    armLength2: 130,
  },
];

describe('AnswerSlots', () => {
  it('renders all four ranking slots', () => {
    const mockOnClear = vi.fn();
    
    render(
      <AnswerSlots
        selections={[]}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('Smallest')).toBeInTheDocument();
    expect(screen.getByText('2nd Smallest')).toBeInTheDocument();
    expect(screen.getByText('2nd Largest')).toBeInTheDocument();
    expect(screen.getByText('Largest')).toBeInTheDocument();
  });

  it('shows selection progress indicator', () => {
    const mockOnClear = vi.fn();
    
    render(
      <AnswerSlots
        selections={['angle-1', 'angle-2']}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('Selected: 2/4')).toBeInTheDocument();
  });

  it('displays selected angles in correct slots', () => {
    const mockOnClear = vi.fn();
    const selections = ['angle-1', 'angle-2', 'angle-3'];
    
    render(
      <AnswerSlots
        selections={selections}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    // Check that angle IDs are displayed in the slots
    expect(screen.getByText('angle-1')).toBeInTheDocument();
    expect(screen.getByText('angle-2')).toBeInTheDocument();
    expect(screen.getByText('angle-3')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const mockOnClear = vi.fn();
    
    render(
      <AnswerSlots
        selections={['angle-1']}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText('Clear Selections');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('disables clear button when no selections', () => {
    const mockOnClear = vi.fn();
    
    render(
      <AnswerSlots
        selections={[]}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText('Clear Selections');
    expect(clearButton).toBeDisabled();
  });

  it('shows empty state for unselected slots', () => {
    const mockOnClear = vi.fn();
    
    render(
      <AnswerSlots
        selections={[]}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    // Should show "Click an angle to select" text for empty slots
    const emptySlotTexts = screen.getAllByText(/Click an angle/);
    expect(emptySlotTexts).toHaveLength(4);
  });

  it('renders position numbers correctly', () => {
    const mockOnClear = vi.fn();
    
    render(
      <AnswerSlots
        selections={['angle-1', 'angle-2']}
        angles={mockAngles}
        onClear={mockOnClear}
      />
    );

    // Check that position numbers 1-4 are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});