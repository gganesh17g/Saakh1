import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import WorkspacePage from "../pages/Workspace";
describe("Accessible product controls", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) || null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
        key: (index: number) => Array.from(values.keys())[index] || null,
        get length() {
          return values.size;
        },
      },
    });
  });
  it("recalculates economics after editing assumptions", () => {
    render(
      <MemoryRouter>
        <WorkspacePage page="impact" />
      </MemoryRouter>,
    );
    const field = screen.getByLabelText("Application volume");
    fireEvent.change(field, { target: { value: "0" } });
    expect(screen.getByText("₹30.00 L")).toBeTruthy();
  });
  it("navigates guided demo checkpoints", () => {
    render(
      <MemoryRouter>
        <WorkspacePage page="guide" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next / skip" }));
    expect(
      screen.getByRole("heading", { name: /Build a financial twin/ }),
    ).toBeTruthy();
  });
});
