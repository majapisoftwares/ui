"use client";

import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";

export type FileTreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: FileTreeNode[] };

export interface FileTreeProps {
  files: FileTreeNode[];
  /** The selected file's path. */
  selected?: string;
  onSelect?: (path: string) => void;
}

function Node({
  node,
  selected,
  onSelect,
}: {
  node: FileTreeNode;
  selected?: string;
  onSelect?: (path: string) => void;
}) {
  if (node.type === "folder")
    return (
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal aria-expanded:bg-transparent aria-expanded:hover:bg-muted dark:aria-expanded:hover:bg-muted/50"
            />
          }
        >
          <ChevronRightIcon className="transition-transform group-data-panel-open/button:rotate-90" />
          <FolderIcon />
          {node.name}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 flex flex-col">
            {node.children.map((child) => (
              <Node
                key={child.path}
                node={child}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start font-normal",
        selected === node.path && "bg-accent text-accent-foreground",
      )}
      aria-current={selected === node.path ? "true" : undefined}
      onClick={() => onSelect?.(node.path)}
    >
      <FileIcon />
      {node.name}
    </Button>
  );
}

/**
 * The files an agent changed, as folders that open and files to pick (shadcn
 * AI Elements File Tree). For one file it read or edited, use a Tool line.
 */
export function FileTree({ files, selected, onSelect }: FileTreeProps) {
  return (
    <div className="flex w-full flex-col text-sm">
      {files.map((node) => (
        <Node
          key={node.path}
          node={node}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/** Builds the tree from paths ("app/page.tsx", "app/layout.tsx" → app/ with two files). */
export function fileTree(paths: string[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  for (const path of paths) {
    const parts = path.split("/").filter(Boolean);
    let level = root;
    parts.forEach((name, index) => {
      const at = parts.slice(0, index + 1).join("/");
      if (index === parts.length - 1) {
        level.push({ type: "file", name, path: at });
        return;
      }
      let folder = level.find(
        (node): node is Extract<FileTreeNode, { type: "folder" }> =>
          node.type === "folder" && node.path === at,
      );
      if (!folder) {
        folder = { type: "folder", name, path: at, children: [] };
        level.push(folder);
      }
      level = folder.children;
    });
  }
  return root;
}
