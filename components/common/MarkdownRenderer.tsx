
import React, { useMemo } from 'react';

interface MarkdownRendererProps {
  markdown: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {

  const renderedHtml = useMemo(() => {
    if (!markdown) return '';

    let html = markdown;

    // Process block-level elements first
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `<pre class="bg-code-bg text-code-text p-4 my-4 rounded-md overflow-x-auto text-sm font-mono border border-code-border"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // Unordered lists
    html = html.replace(/^\s*[-*+]\s+(.*)/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 my-4 pl-2">$1</ul>');
    // Clean up adjacent ULs into one
    html = html.replace(/<\/ul>\n?<ul[^>]*>/g, '');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-text-primary mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-text-primary mt-8 mb-3 pb-1 border-b border-outline-variant">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-primary mt-4 mb-4">$1</h1>');
    
    // Horizontal Rules
    html = html.replace(/^-{3,}|_{3,}|\*{3,}/g, '<hr class="my-6 border-outline-variant">');


    // Process inline elements
    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
     html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-code-bg text-secondary px-1.5 py-1 rounded-sm font-mono text-sm">$1</code>');

    // Paragraphs (wrap lines that aren't other elements)
    html = html.split('\n').map(line => {
      if (line.trim() === '') return '';
      if (line.match(/^<(h[1-3]|ul|li|pre|hr)/)) {
        return line;
      }
      return `<p class="mb-3 leading-relaxed">${line}</p>`;
    }).join('');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');


    return html;
  }, [markdown]);

  return (
    <div 
        className="prose text-text-secondary max-w-none" 
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
