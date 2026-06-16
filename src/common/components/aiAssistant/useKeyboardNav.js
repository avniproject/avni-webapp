import { useEffect } from "react";

/**
 * Keyboard navigation for the two-pane HITL confirmation view.
 *
 * Bound on `document` while mounted. Ignores keystrokes when the user is
 * typing into an input/textarea/contenteditable so the edit-value field
 * works normally.
 *
 * Args:
 *  - enabled: bool — toggle the listener without unmount/remount churn
 *  - onMove(delta): move selection by +1 / -1
 *  - onDecide(decision): "yes" | "no" — also advances selection by +1
 *  - onEnterEdit(): caller switches the detail pane to edit mode
 *  - onApply(): caller submits decisions when Enter is pressed and ready
 *  - applyReady: bool — gates the Enter shortcut
 *
 * Key map (matches the labels rendered next to each action button):
 *    ↑/↓   navigate
 *    Y     accept and advance
 *    N     reject and advance
 *    E     enter edit mode on the focused change
 *    Enter apply all decisions when ready
 */
export const useKeyboardNav = ({ enabled = true, onMove, onDecide, onEnterEdit, onApply, applyReady = false }) => {
  useEffect(() => {
    if (!enabled) return undefined;

    const isTyping = (target) => target?.matches?.("input, textarea, [contenteditable], [contenteditable=true]");

    const handler = (event) => {
      if (isTyping(event.target)) return;
      // Honour modifier keys — the user might be trying to copy/paste etc.
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          onMove?.(1);
          return;
        case "ArrowUp":
          event.preventDefault();
          onMove?.(-1);
          return;
        case "y":
        case "Y":
          event.preventDefault();
          onDecide?.("yes");
          return;
        case "n":
        case "N":
          event.preventDefault();
          onDecide?.("no");
          return;
        case "e":
        case "E":
          event.preventDefault();
          onEnterEdit?.();
          return;
        case "Enter":
          if (applyReady) {
            event.preventDefault();
            onApply?.();
          }
          return;
        default:
          return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled, onMove, onDecide, onEnterEdit, onApply, applyReady]);
};
