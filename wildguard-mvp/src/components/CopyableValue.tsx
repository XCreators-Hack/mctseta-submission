"use client";

import { useState } from "react";

interface CopyableValueProps {
  value: string;
}

export default function CopyableValue({ value }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — fail
      // quietly, the value is still visible and selectable as text.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mono text-sm text-text hover:text-accent transition-colors underline decoration-dotted decoration-border underline-offset-4"
      title="Copy to clipboard"
    >
      {copied ? "Copied" : value}
    </button>
  );
}
