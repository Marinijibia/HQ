'use client';

import * as React from 'react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

export function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  const blocks = React.useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockBuffer: string[] = [];

    lines.forEach((line, idx) => {
      // Code block start/end ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          result.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl bg-slate-900 dark:bg-black/90 border border-cyan-500/30 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto shadow-md">
              {codeBlockLang && (
                <div className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-widest pb-1 mb-2 border-b border-white/10">
                  {codeBlockLang}
                </div>
              )}
              <pre className="whitespace-pre-wrap">{codeBlockBuffer.join('\n')}</pre>
            </div>
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.trim().replace('```', '');
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        result.push(<div key={`empty-${idx}`} className="h-2" />);
        return;
      }

      // H1 #
      if (trimmed.startsWith('# ')) {
        result.push(
          <h1 key={`h1-${idx}`} className="text-lg sm:text-xl font-black text-foreground mt-4 mb-2 tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            {parseInlineMarkdown(trimmed.replace('# ', ''))}
          </h1>
        );
        return;
      }

      // H2 ##
      if (trimmed.startsWith('## ')) {
        result.push(
          <h2 key={`h2-${idx}`} className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-300 mt-3 mb-1.5 border-b border-card-border pb-1">
            {parseInlineMarkdown(trimmed.replace('## ', ''))}
          </h2>
        );
        return;
      }

      // H3 ###
      if (trimmed.startsWith('### ')) {
        result.push(
          <h3 key={`h3-${idx}`} className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-300 mt-2.5 mb-1 flex items-center gap-1.5">
            <span className="text-cyan-500 font-black">&bull;</span>
            {parseInlineMarkdown(trimmed.replace('### ', ''))}
          </h3>
        );
        return;
      }

      // H4 ####
      if (trimmed.startsWith('#### ')) {
        result.push(
          <h4 key={`h4-${idx}`} className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-2 mb-1">
            {parseInlineMarkdown(trimmed.replace('#### ', ''))}
          </h4>
        );
        return;
      }

      // H5 #####
      if (trimmed.startsWith('##### ')) {
        result.push(
          <h5 key={`h5-${idx}`} className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 mb-0.5">
            {parseInlineMarkdown(trimmed.replace('##### ', ''))}
          </h5>
        );
        return;
      }

      // Bullet list - or *
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[-*]\s+/, '');
        result.push(
          <div key={`ul-${idx}`} className="flex items-start gap-2 text-xs sm:text-sm my-1 pl-1.5 text-foreground/90 font-medium">
            <span className="text-cyan-500 font-black mt-0.5">&rarr;</span>
            <span className="flex-1">{parseInlineMarkdown(itemText)}</span>
          </div>
        );
        return;
      }

      // Numbered list 1. 2.
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (match) {
          result.push(
            <div key={`ol-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm my-1 pl-1.5 text-foreground/90 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-mono font-black text-[11px]">
                {match[1]}
              </span>
              <span className="flex-1 pt-0.5">{parseInlineMarkdown(match[2])}</span>
            </div>
          );
          return;
        }
      }

      // Blockquote >
      if (trimmed.startsWith('> ')) {
        result.push(
          <blockquote key={`bq-${idx}`} className="my-2.5 border-l-3 border-cyan-500 bg-cyan-500/10 p-3 rounded-r-xl text-xs sm:text-sm text-foreground/90 font-medium">
            {parseInlineMarkdown(trimmed.replace('> ', ''))}
          </blockquote>
        );
        return;
      }

      // Normal paragraph
      result.push(
        <p key={`p-${idx}`} className="text-xs sm:text-sm my-1 leading-relaxed text-foreground/90 font-medium">
          {parseInlineMarkdown(line)}
        </p>
      );
    });

    return result;
  }, [content]);

  return <div className={`space-y-1 text-left ${className}`}>{blocks}</div>;
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/60 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-bold">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-black text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-cyan-700 dark:text-cyan-200 font-semibold">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}
