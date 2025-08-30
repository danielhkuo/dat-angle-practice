import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AngleDisplay } from '../AngleDisplay';
import { Angle } from '@/types';

const mockAngle: Angle = {
  id: 'test-angle-1',
  degrees: 45.5,
  rotation: 30,
  armLength1: 60,
  armLength2: 80
};

describe('AngleDisplay', () => {
  it('renders angle with SVG elements', () => {
    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={mockAngle}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    // Check if SVG is rendered
    const svg = screen.getByRole('button');
    expect(svg).toBeInTheDocument();
    
    // Check aria-label includes angle degrees
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('45.5'));
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={mockAngle}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const angleElement = screen.getByRole('button');
    fireEvent.click(angleElement);
    
    expect(mockOnClick).toHaveBeenCalledWith('test-angle-1');
  });

  it('shows selection badge when selected', () => {
    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={mockAngle}
        isSelected={true}
        selectionOrder={2}
        onClick={mockOnClick}
      />
    );

    // Check if selection badge is visible
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check if aria-label includes selection info
    const angleElement = screen.getByRole('button');
    expect(angleElement).toHaveAttribute('aria-label', expect.stringContaining('selected as position 2'));
  });

  it('applies selected styles when selected', () => {
    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={mockAngle}
        isSelected={true}
        selectionOrder={1}
        onClick={mockOnClick}
      />
    );

    const angleElement = screen.getByRole('button');
    // The button element itself has the styling classes
    expect(angleElement).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('does not call onClick when disabled', () => {
    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={mockAngle}
        isSelected={false}
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const angleElement = screen.getByRole('button');
    fireEvent.click(angleElement);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation', () => {
    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={mockAngle}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const angleElement = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(angleElement, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith('test-angle-1');
    
    // Test Space key
    fireEvent.keyDown(angleElement, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders different angle configurations correctly', () => {
    const wideAngle: Angle = {
      id: 'wide-angle',
      degrees: 120,
      rotation: 0,
      armLength1: 50,
      armLength2: 70
    };

    const mockOnClick = vi.fn();
    
    render(
      <AngleDisplay
        angle={wideAngle}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    const angleElement = screen.getByRole('button');
    expect(angleElement).toHaveAttribute('aria-label', expect.stringContaining('120.0'));
  });
});