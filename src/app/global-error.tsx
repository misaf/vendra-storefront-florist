"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself. It renders its
 * own <html>/<body> and runs OUTSIDE the locale providers, so it can't use
 * i18n — kept deliberately minimal and self-styled.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          // This boundary renders its own document outside the locale layout,
          // so `globals.css` never loads and no token resolves. The Organic
          // palette is restated inline: page ground and ink from `--background`
          // / `--foreground`, and it tracks them by hand.
          background: "#f5ead8",
          color: "#201e1d",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 1.5rem", lineHeight: 1.6, color: "#645c50" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              cursor: "pointer",
              // `rounded-full` and clay-700 on cream (5.72:1), matching the
              // button primitive this page cannot import.
              borderRadius: "999px",
              border: "none",
              background: "#8c491a",
              color: "#f5ead8",
              padding: "0.625rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
