import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders portfolio navigation", () => {
  render(<App />);
  expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /projects/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /contact/i })).toBeInTheDocument();
});
