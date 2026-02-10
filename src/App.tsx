import React, { useState, useCallback, useEffect, useRef } from 'react';
import { compile } from '0x-lang/compiler';
import { tokenize } from '0x-lang/tokenizer';
import { EXAMPLES, EXAMPLE_NAMES } from './examples';

type Target = 'react' | 'vue' | 'svelte';

const TARGET_LABELS: Record<Target, string> = {
  react: 'React',
  vue: 'Vue 3',
  svelte: 'Svelte 5',
};

const TARGET_EXT: Record<Target, string> = {
  react: '.jsx',
  vue: '.vue',
  svelte: '.svelte',
};

function App() {
  const [source, setSource] = useState(EXAMPLES.counter);
  const [target, setTarget] = useState<Target>('react');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ lines: 0, tokens: 0, srcLines: 0, srcTokens: 0 });
  const [selectedExample, setSelectedExample] = useState('counter');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const doCompile = useCallback((src: string, tgt: Target) => {
    try {
      const result = compile(src, { target: tgt, validate: true });
      setOutput(result.code);
      setError('');

      const srcLines = src.split('\n').filter(l => l.trim()).length;
      const srcTokens = src.split(/\s+/).filter(Boolean).length;
      setStats({
        lines: result.lineCount,
        tokens: result.tokenCount,
        srcLines,
        srcTokens,
      });
    } catch (e: any) {
      setOutput('');
      setError(e.message || String(e));
      setStats({ lines: 0, tokens: 0, srcLines: 0, srcTokens: 0 });
    }
  }, []);

  useEffect(() => {
    doCompile(source, target);
  }, [source, target, doCompile]);

  const handleExampleChange = (name: string) => {
    setSelectedExample(name);
    setSource(EXAMPLES[name]);
  };

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const shareUrl = useCallback(() => {
    const encoded = encodeURIComponent(source);
    const url = `${window.location.origin}${window.location.pathname}?src=${encoded}&target=${target}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [source, target]);

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const srcParam = params.get('src');
    const targetParam = params.get('target') as Target | null;
    if (srcParam) setSource(decodeURIComponent(srcParam));
    if (targetParam && TARGET_LABELS[targetParam]) setTarget(targetParam);
  }, []);

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      setSource(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const savings = stats.srcTokens > 0
    ? Math.round((1 - stats.srcTokens / stats.tokens) * 100)
    : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>
            <span style={styles.logoAi}>0x</span>
            <span style={styles.badge}>Playground</span>
          </h1>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.exampleButtons}>
            {Object.entries(EXAMPLE_NAMES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleExampleChange(key)}
                style={{
                  ...styles.exampleBtn,
                  ...(selectedExample === key ? styles.exampleBtnActive : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.targetTabs}>
            {(Object.keys(TARGET_LABELS) as Target[]).map(t => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                style={{
                  ...styles.targetTab,
                  ...(target === t ? styles.targetTabActive : {}),
                }}
              >
                {TARGET_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Editor Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>0x Source</span>
            <span style={styles.panelInfo}>
              {stats.srcLines} lines / {stats.srcTokens} tokens
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={source}
            onChange={e => setSource(e.target.value)}
            onKeyDown={handleTab}
            style={styles.editor}
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Output Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>
              Output ({TARGET_LABELS[target]} {TARGET_EXT[target]})
            </span>
            <span style={styles.panelInfo}>
              {stats.lines} lines / {stats.tokens} tokens
              {savings > 0 && (
                <span style={styles.savings}> ({savings}% savings)</span>
              )}
              <button onClick={copyOutput} style={styles.copyBtn}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={shareUrl} style={styles.copyBtn}>
                Share
              </button>
            </span>
          </div>
          {error ? (
            <div style={styles.errorPanel}>
              <div style={styles.errorTitle}>Compilation Error</div>
              <pre style={styles.errorText}>{error}</pre>
            </div>
          ) : (
            <pre style={styles.outputCode}><code>{output}</code></pre>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>0x Compiler v0.1.0 — AI-First Programming Language</span>
        <span style={styles.footerRight}>
          React / Vue 3 / Svelte 5 code generation
        </span>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0d1117',
    color: '#e6edf3',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#161b22',
    borderBottom: '1px solid #30363d',
    gap: '16px',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#e6edf3',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  logoAi: {
    color: '#58a6ff',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#8b949e',
    marginLeft: '8px',
    padding: '2px 6px',
    border: '1px solid #30363d',
    borderRadius: '12px',
  },
  exampleButtons: {
    display: 'flex',
    gap: '4px',
  },
  exampleBtn: {
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#8b949e',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  exampleBtnActive: {
    color: '#e6edf3',
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
  },
  targetTabs: {
    display: 'flex',
    gap: '2px',
    backgroundColor: '#21262d',
    borderRadius: '6px',
    padding: '2px',
  },
  targetTab: {
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#8b949e',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  targetTabActive: {
    color: '#e6edf3',
    backgroundColor: '#30363d',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#161b22',
    borderBottom: '1px solid #30363d',
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e6edf3',
  },
  panelInfo: {
    fontSize: '12px',
    color: '#8b949e',
  },
  savings: {
    color: '#3fb950',
    fontWeight: 600,
  },
  editor: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
    fontSize: '14px',
    lineHeight: '1.6',
    tabSize: 2,
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    overflowX: 'auto',
  },
  divider: {
    width: '1px',
    backgroundColor: '#30363d',
    flexShrink: 0,
  },
  outputCode: {
    flex: 1,
    padding: '16px',
    margin: 0,
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
    fontSize: '13px',
    lineHeight: '1.6',
    overflow: 'auto',
    whiteSpace: 'pre',
  },
  errorPanel: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#0d1117',
    overflow: 'auto',
  },
  errorTitle: {
    color: '#f85149',
    fontWeight: 600,
    marginBottom: '8px',
    fontSize: '14px',
  },
  errorText: {
    color: '#f85149',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
    fontSize: '13px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 16px',
    backgroundColor: '#161b22',
    borderTop: '1px solid #30363d',
    fontSize: '12px',
    color: '#8b949e',
    flexShrink: 0,
  },
  footerRight: {
    color: '#58a6ff',
  },
  copyBtn: {
    marginLeft: '8px',
    padding: '2px 8px',
    fontSize: '11px',
    color: '#e6edf3',
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default App;
