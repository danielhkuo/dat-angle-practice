import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import {
  ErrorBoundary,
  AngleErrorBoundary,
  TestFlowErrorBoundary,
} from "../ErrorBoundary";

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws an error for testing
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders error UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
});

describe("AngleErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <AngleErrorBoundary>
        <ThrowError shouldThrow={false} />
      </AngleErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders angle-specific error UI when there is an error", () => {
    render(
      <AngleErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AngleErrorBoundary>
    );

    expect(screen.getByText("Unable to display angle")).toBeInTheDocument();
  });
});

describe("TestFlowErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <TestFlowErrorBoundary>
        <ThrowError shouldThrow={false} />
      </TestFlowErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders test-specific error UI when there is an error", () => {
    render(
      <TestFlowErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TestFlowErrorBoundary>
    );

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(screen.getByText("Return to Start")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });
});
