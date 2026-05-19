import { window } from 'vscode';

/**
 * Present a simple pick UI to select a single annotation from discovered list.
 * Returns the selected comment object or undefined.
 */
export async function selectAnnotation(
  comments: Array<{
    start: number;
    end: number;
    line: number;
    preview: string;
    fullText: string;
    tag?: string;
  }>,
  placeHolder?: string,
) {
  const picks = comments.map((comment) => ({
    label: `Line ${String(comment.line)}: ${comment.preview}`,
    description: comment.fullText,
    comment,
  }));

  const selected = await window.showQuickPick(picks as any, {
    placeHolder: placeHolder ?? 'Select annotation',
  });
  // Return `null` when user explicitly cancels the QuickPick so callers
  // can distinguish cancellation from "no annotations found".
  return selected ? (selected as any).comment : null;
}
