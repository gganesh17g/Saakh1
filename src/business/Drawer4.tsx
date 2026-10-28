import { useEffect, useRef, type ReactNode } from "react";
export function Drawer4({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="w4-drawer"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        if (
          confirm(
            "Close this form? Unsaved customer changes will be discarded.",
          )
        )
          close();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          aria-label="Close customer panel"
          onClick={() => {
            if (confirm("Discard unsaved customer changes?")) close();
          }}
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
