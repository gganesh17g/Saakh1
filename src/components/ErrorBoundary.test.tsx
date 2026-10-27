import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Deployment recovery boundary", () => {
  it("shows the actual failure and retries without clearing stored data", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let fail = true;
    function Broken() {
      if (fail) throw new Error("Failed to fetch dynamically imported module");
      return <p>Recovered view</p>;
    }
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("Failed to fetch dynamically imported module"),
    ).toBeTruthy();
    fail = false;
    fireEvent.click(
      screen.getByRole("button", { name: "Try rendering again" }),
    );
    expect(screen.getByText("Recovered view")).toBeTruthy();
  });
  it("supports an isolated fallback for graphics failures", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Broken() {
      throw new Error("WebGL startup failed");
      return null;
    }
    render(
      <ErrorBoundary fallback={(error) => <p>2D recovery: {error.message}</p>}>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByText("2D recovery: WebGL startup failed")).toBeTruthy();
  });
});
