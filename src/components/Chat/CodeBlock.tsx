import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import './CodeBlock.css';

interface CodeBlockProps {
  language: string;
  code: string;
  isDark: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, isDark }) => {
  const [Highlighter, setHighlighter] = useState<any>(null);
  const [style, setStyle] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Lazy load syntax highlighter only when needed
    Promise.all([
      import('react-syntax-highlighter'),
      import('react-syntax-highlighter/dist/esm/styles/prism'),
    ]).then(([highlighterModule, stylesModule]) => {
      setHighlighter(() => highlighterModule.Prism);
      setStyle(isDark ? stylesModule.vscDarkPlus : stylesModule.vs);
    }).catch((error) => {
      console.error('Failed to load syntax highlighter:', error);
    });
  }, [isDark]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLanguage = language.charAt(0).toUpperCase() + language.slice(1);

  if (!Highlighter || !style) {
    // Fallback while loading
    return (
      <div className="code-block">
        <div className="code-block__header">
          <span className="code-block__language">{displayLanguage}</span>
          <button
            className="code-block__copy-button"
            onClick={handleCopy}
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <pre className="code-block__fallback" style={{
          background: isDark ? '#1e1e1e' : '#f6f6f6',
        }}>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__language">{displayLanguage}</span>
        <button
          className="code-block__copy-button"
          onClick={handleCopy}
          aria-label="Copy code"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <Highlighter
        style={style}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 0.5rem 0.5rem',
        }}
      >
        {code}
      </Highlighter>
    </div>
  );
};
