import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getLabel, ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getLabel unit tests ---

test("str_replace_editor create returns Creating <filename>", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating App.jsx");
});

test("str_replace_editor create with nested path extracts filename", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "/components/Button.jsx" })).toBe("Creating Button.jsx");
});

test("str_replace_editor str_replace returns Editing <filename>", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.jsx" })).toBe("Editing Button.jsx");
});

test("str_replace_editor insert returns Editing <filename>", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "/components/Card.tsx" })).toBe("Editing Card.tsx");
});

test("str_replace_editor view returns Reading <filename>", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading App.jsx");
});

test("file_manager rename returns Renaming <filename>", () => {
  expect(getLabel("file_manager", { command: "rename", path: "/components/OldName.jsx" })).toBe("Renaming OldName.jsx");
});

test("file_manager delete returns Deleting <filename>", () => {
  expect(getLabel("file_manager", { command: "delete", path: "/components/Card.jsx" })).toBe("Deleting Card.jsx");
});

test("unknown tool returns raw toolName", () => {
  expect(getLabel("some_other_tool", { command: "run", path: "/foo.js" })).toBe("some_other_tool");
});

test("str_replace_editor with empty path falls back to toolName", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "" })).toBe("str_replace_editor");
});

test("str_replace_editor with no path falls back to toolName", () => {
  expect(getLabel("str_replace_editor", {})).toBe("str_replace_editor");
});

// --- ToolCallBadge render test ---

test("ToolCallBadge renders friendly label", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Modal.jsx" }}
    />
  );
  expect(screen.getByText("Creating Modal.jsx")).toBeDefined();
});
