import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Timer } from '../Timer';
import * as TestProvider from '@/providers/TestProvider';

// Mock the TestProvider hook
vi.mock('@/providers/TestProvider', () => ({
  useTestTimer: vi.fn(),
}));

const mockUseTestTimer = vi.mocked(TestProvider.useTestTimer);

describe('Timer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when test is not active', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 600,
      formattedTime: '10:00',
      isWarning: false,
      isActive: false,
    });

    const { container } = render(<Timer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders timer with normal styling when time is not low', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 300,
      formattedTime: '05:00',
      isWarning: false,
      isActive: true,
    });

    render(<Timer />);
    
    const timer = screen.getByRole('timer');
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveTextContent('05:00');
    expect(timer).toHaveClass('bg-blue-100', 'text-blue-700');
    expect(timer).not.toHaveClass('bg-red-100', 'animate-pulse');
  });

  it('renders timer with warning styling when time is low', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 45,
      formattedTime: '00:45',
      isWarning: true,
      isActive: true,
    });

    render(<Timer />);
    
    const timer = screen.getByRole('timer');
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveTextContent('00:45');
    expect(timer).toHaveTextContent('TIME LOW!');
    expect(timer).toHaveClass('bg-red-100', 'text-red-700', 'animate-pulse');
  });

  it('displays formatted time correctly', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 125,
      formattedTime: '02:05',
      isWarning: false,
      isActive: true,
    });

    render(<Timer />);
    
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 180,
      formattedTime: '03:00',
      isWarning: false,
      isActive: true,
    });

    render(<Timer />);
    
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-label', 'Time remaining: 03:00');
    expect(timer).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className when provided', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 600,
      formattedTime: '10:00',
      isWarning: false,
      isActive: true,
    });

    render(<Timer className="custom-class" />);
    
    const timer = screen.getByRole('timer');
    expect(timer).toHaveClass('custom-class');
  });

  it('shows clock icon', () => {
    mockUseTestTimer.mockReturnValue({
      timeRemaining: 600,
      formattedTime: '10:00',
      isWarning: false,
      isActive: true,
    });

    render(<Timer />);
    
    const icon = screen.getByRole('timer').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});