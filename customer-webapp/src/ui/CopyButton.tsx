import { useState } from 'react';
import Icon from './Icon';

export default function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied' }: {
  value: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      className={`copy-btn ${copied ? 'copy-btn--copied' : ''}`}
      onClick={handleCopy}
      aria-label={`${copied ? copiedLabel : label}: ${value}`}
    >
      <Icon name={copied ? 'check' : 'copy'} size={13} />
      {copied ? copiedLabel : label}
    </button>
  );
}
