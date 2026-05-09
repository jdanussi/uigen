interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
}

export function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : "";
  const fileName = path.split("/").filter(Boolean).pop() ?? path;
  const command = args.command as string | undefined;

  if (toolName === "str_replace_editor") {
    if (!fileName) return toolName;
    switch (command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
      case "insert":
        return `Editing ${fileName}`;
      case "view":
        return `Reading ${fileName}`;
      default:
        return `Working on ${fileName}`;
    }
  }

  if (toolName === "file_manager") {
    if (!fileName) return toolName;
    switch (command) {
      case "rename":
        return `Renaming ${fileName}`;
      case "delete":
        return `Deleting ${fileName}`;
      default:
        return `Managing ${fileName}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args }: ToolCallBadgeProps) {
  return <span>{getLabel(toolName, args)}</span>;
}
