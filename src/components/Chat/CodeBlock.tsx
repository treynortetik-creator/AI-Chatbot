import React, { useState, useEffect } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
  isDark: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, isDark }) => {
  const [Highlighter, setHighlighter] = useState<any>(null);
  const [style, setStyle] = useState<any>(null);

  useEffect(() => {
    // Lazy load syntax highlighter only when needed
    Promise.all([
      import('react-syntax-highlighter'),
      import('react-syntax-highlighter/dist/esm/styles/prism'),
    ]).then(([highlighterModule, stylesModule]) => {
      setHighlighter(() => highlighterModule.Prism);
      setStyle(isDark ? stylesModule.vscDarkPlus : stylesModule.vs);
    });
  }, [isDark]);

  if (!Highlighter || !style) {
    // Fallback while loading
    return (
      <pre style={{
        padding: '1rem',
        background: isDark ? '#1e1e1e' : '#f6f6f6',
        borderRadius: '0.5rem',
        overflow: 'auto',
      }}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <Highlighter
      style={style}
      language={language}
      PreTag="div"
    >
      {code}
    </Highlighter>
  );
};
