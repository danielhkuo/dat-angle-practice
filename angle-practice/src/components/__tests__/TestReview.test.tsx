import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestReview } from '../TestReview';
import { TestSession, Question, Angle } from '@/types';

// Mock data for testing
const mockAngles: Angle[] = [
  {
    id: 'angle-1',
    degrees: 30,
    rotation: 0,
    armLength1: 100,
    armLength2: 120
  },
  {
    id: 'angle-2',
    degrees: 45,
    rotation: 90,
    armLength1: 110,
    armLength2: 100
  },
  {
    id: 'angle-3',
    degrees: 60,
    rotation: 180,
    armLength1: 90,
    armLength2: 130
  },
  {
    id: 'angle-4',
    degrees: 75,
    rotation: 270,
    armLength1: 120,
    armLength2: 110
  }
];

const mockQuestion: Question = {
  id: 1,
  angles: mockAngles,
  correctOrder: ['angle-1', 'angle-2', 'angle-3', 'angle-4'] // 30°, 45°, 60°, 75°
};

const mockSession: TestSession = {
  id: 'test-session-1',
  questions: [mockQuestion],
  userAnswers: [['angle-2', 'angle-1', 'angle-3', 'angle-4']], // User got first two wrong
  startTime: Date.now() - 300000, // 5 minutes ago
  endTime: Date.now(),
  isCompleted: true,
  score: 0
};

const mockSessionAllCorrect: TestSession = {
  id: 'test-session-2',
  questions: [mockQuestion],
  userAnswers: [['angle-1', 'angle-2', 'angle-3', 'angle-4']], // All correct
  startTime: Date.now() - 300000,
  endTime: Date.now(),
  isCompleted: true,
  score: 1
};

describe('TestReview', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders test review interface correctly', () => {
    render(<TestReview session={mockSession} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Review')).toBeInTheDocument();
    expect(screen.getByText('Review your answers and see the correct solutions')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('displays angles with correct highlighting', () => {
    render(<TestReview session={mockSession} onClose={mockOnClose} />);
    
    // Should show angle degrees (multiple instances expected)
    expect(screen.getAllByText('30.0°')).toHaveLength(3); // In angle display and answer sections
    expect(screen.getAllByText('45.0°')).toHaveLength(3);
    expect(screen.getAllByText('60.0°')).toHaveLength(3);
    expect(screen.getAllByText('75.0°')).toHaveLength(3);
  });

  it('shows user answer vs correct answer comparison', () => {
    render(<TestReview session={mockSession} onClose={mockOnClose} />);
    
    expect(screen.getByText('Your Answer:')).toBeInTheDocument();
    expect(screen.getByText('Correct Answer:')).toBeInTheDocument();
    
    // Should show incorrect positions
    expect(screen.getAllByText('Incorrect position')).toHaveLength(2);
    expect(screen.getAllByText('Correct position')).toHaveLength(2);
  });

  it('displays correct status for all correct answers', () => {
    render(<TestReview session={mockSessionAllCorrect} onClose={mockOnClose} />);
    
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getAllByText('Correct position')).toHaveLength(4);
  });

  it('handles close button click', () => {
    render(<TestReview session={mockSession} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close Review');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows legend with correct information', () => {
    render(<TestReview session={mockSession} onClose={mockOnClose} />);
    
    expect(screen.getByText('Legend:')).toBeInTheDocument();
    expect(screen.getByText('Correct selection and position')).toBeInTheDocument();
    expect(screen.getByText('Incorrect selection or position')).toBeInTheDocument();
    expect(screen.getByText('Correct answer (not selected by you)')).toBeInTheDocument();
  });

  it('handles navigation for multiple questions', () => {
    const multiQuestionSession: TestSession = {
      ...mockSession,
      questions: [mockQuestion, { ...mockQuestion, id: 2 }],
      userAnswers: [
        ['angle-2', 'angle-1', 'angle-3', 'angle-4'],
        ['angle-1', 'angle-2', 'angle-3', 'angle-4']
      ]
    };

    render(<TestReview session={multiQuestionSession} onClose={mockOnClose} />);
    
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    
    // Test next button
    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    
    // Test previous button
    const prevButton = screen.getByText('← Previous');
    fireEvent.click(prevButton);
    
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('handles empty user answers gracefully', () => {
    const sessionWithEmptyAnswer: TestSession = {
      ...mockSession,
      userAnswers: [[]] // Empty answer
    };

    render(<TestReview session={sessionWithEmptyAnswer} onClose={mockOnClose} />);
    
    expect(screen.getByText('No answer provided')).toBeInTheDocument();
  });
});