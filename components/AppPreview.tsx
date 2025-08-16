

import React, { useMemo } from 'react';
import type { GeneratedFile, DeviceView } from '../types';

interface AppPreviewProps {
  files: GeneratedFile[];
  entryPoint: string; // e.g., "public/index.html"
  deviceView?: DeviceView; 
}

const DEVICE_DIMENSIONS: Record<DeviceView, { width: string; height: string; scale?: number }> = {
  phone: { width: '375px', height: '667px', scale: 1 },
  tablet: { width: '768px', height: '1024px', scale: 1 },
  desktop: { width: '100%', height: '100%', scale: 1 },
  tv: { width: '100%', height: '100%', scale: 1 },
};

const getFileBlobUrl = (filePath: string, files: GeneratedFile[], baseEntryPointPath: string): string | null => {
    const entryDir = baseEntryPointPath.includes('/') ? baseEntryPointPath.substring(0, baseEntryPointPath.lastIndexOf('/')) : '';
    
    let resolvedPath = filePath;
    if (filePath.startsWith('./')) {
        resolvedPath = `${entryDir}/${filePath.substring(2)}`;
    } else if (!filePath.startsWith('/') && !/^[a-zA-Z]+:\/\//.test(filePath) && entryDir) { 
        resolvedPath = `${entryDir}/${filePath}`;
    }
    const segments = resolvedPath.split('/');
    const normalizedSegments: string[] = [];
    for (const segment of segments) {
        if (segment === '..') {
            if (normalizedSegments.length > 0 && normalizedSegments[normalizedSegments.length -1] !== '..') {
                 normalizedSegments.pop();
            } else { 
                normalizedSegments.push(segment);
            }
        } else if (segment !== '.' && segment !== '') {
            normalizedSegments.push(segment);
        }
    }
    resolvedPath = normalizedSegments.join('/');

    const fileData = files.find(f => f.path === resolvedPath);
    if (!fileData) {
        console.warn(`[AppPreview] Asset not found in project files: ${filePath} (resolved to ${resolvedPath})`);
        return null;
    }

    let mimeType = 'application/octet-stream'; 
    const lowerPath = resolvedPath.toLowerCase();
    if (lowerPath.endsWith('.html')) mimeType = 'text/html';
    else if (lowerPath.endsWith('.css')) mimeType = 'text/css';
    else if (lowerPath.endsWith('.js')) mimeType = 'application/javascript';
    else if (lowerPath.endsWith('.svg')) mimeType = 'image/svg+xml';
    else if (lowerPath.endsWith('.png')) mimeType = 'image/png';
    else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (lowerPath.endsWith('.gif')) mimeType = 'image/gif';
    else if (lowerPath.endsWith('.mp4')) mimeType = 'video/mp4';
    else if (lowerPath.endsWith('.webm')) mimeType = 'video/webm';

    if ((mimeType === 'video/mp4' || mimeType === 'video/webm') && 
        (fileData.content.startsWith('http://') || fileData.content.startsWith('https://'))) {
      return fileData.content; 
    }

    let blob;
    if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/gif') {
        try {
            let base64Data = fileData.content;
            const prefixMatch = fileData.content.match(/^data:image\/(?:jpeg|png|gif);base64,/);
            if (prefixMatch) {
                base64Data = fileData.content.substring(prefixMatch[0].length);
            }

            const byteCharacters = atob(base64Data); 
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: mimeType });
        } catch (e) {
            console.error(`[AppPreview] Error decoding base64 content for ${resolvedPath}:`, e, "Content snippet:", fileData.content.substring(0,100));
            return `data:text/plain,Error%20decoding%20image%20${encodeURIComponent(resolvedPath)}`;
        }
    } else {
        blob = new Blob([fileData.content], { type: mimeType });
    }
    return URL.createObjectURL(blob);
};

export const AppPreview: React.FC<AppPreviewProps> = ({ files, entryPoint, deviceView = 'desktop' }) => {
  const scriptSetup = `
        (function() { 
          const originalConsole = { ...window.console };
          const postLog = (level, args) => {
            try {
              const serializedArgs = args.map(arg => {
                if (arg instanceof Error) {
                  return { __error__: true, name: arg.name, message: arg.message, stack: arg.stack };
                }
                if (arg instanceof HTMLElement) {
                  return arg.tagName + (arg.id ? '#' + arg.id : '') + (arg.className ? '.' + String(arg.className).split(' ').join('.') : '');
                }
                if (typeof arg === 'object' && arg !== null) {
                    try {
                         if (Object.keys(arg).length <= 5 && JSON.stringify(arg).length < 100) {
                            return JSON.stringify(arg);
                        } else {
                            return \`[\${arg.constructor.name || 'Object'}]\`;
                        }
                    } catch (e) { return '[Unserializable Object]'; }
                }
                return arg;
              });
              window.parent.postMessage({ type: 'iframe_console_log', level, payload: serializedArgs }, '*');
            } catch (e) {
              originalConsole.error('Error posting log from iframe:', e, 'Original log:', level, args);
               window.parent.postMessage({ type: 'iframe_console_log', level: 'error', payload: ['Error serializing log arguments from iframe. Check main console.'] }, '*');
            }
          };

          window.console = {
            ...originalConsole,
            log: (...args) => { originalConsole.log(...args); postLog('log', args); },
            warn: (...args) => { originalConsole.warn(...args); postLog('warn', args); },
            error: (...args) => { originalConsole.error(...args); postLog('error', args); },
            info: (...args) => { originalConsole.info(...args); postLog('info', args); },
            debug: (...args) => { originalConsole.debug(...args); postLog('debug', args); },
          };

          window.onerror = (message, source, lineno, colno, error) => {
            originalConsole.error("Iframe uncaught error:", message, source, lineno, colno, error);
            postLog('error', [
              'Uncaught Error:', 
              message, 
              source ? \`at \${source}:\${lineno}:\${colno}\` : \`at line \${lineno}:\${colno}\`, 
              error ? error.stack : '(no stack trace)'
            ]);
            return true; 
          };

          window.onunhandledrejection = (event) => {
            originalConsole.error("Iframe unhandled rejection:", event.reason);
            postLog('error', ['Unhandled Promise Rejection:', event.reason]);
          };
        })();
  `;

  const srcDoc = useMemo(() => {
    const entryFile = files.find(f => f.path === entryPoint);
    if (!entryFile || !entryFile.path.endsWith('.html')) {
      console.error(`[AppPreview] Entry point "${entryPoint}" not found or is not an HTML file.`);
      return `<html><body>Error: Entry point "${entryPoint}" not found or invalid.</body></html>`;
    }

    let htmlContent = entryFile.content;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http:') && !href.startsWith('https:') && !href.startsWith('//')) {
        const blobUrl = getFileBlobUrl(href, files, entryPoint);
        if (blobUrl) link.setAttribute('href', blobUrl);
      }
    });

    doc.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http:') && !src.startsWith('https:') && !src.startsWith('//')) {
        const blobUrl = getFileBlobUrl(src, files, entryPoint);
        if (blobUrl) script.setAttribute('src', blobUrl);
      }
    });
    
    doc.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http:') && !src.startsWith('https:') && !src.startsWith('//') && !src.startsWith('data:')) {
            const blobUrl = getFileBlobUrl(src, files, entryPoint);
            if (blobUrl) img.setAttribute('src', blobUrl);
        }
    });

    doc.querySelectorAll('video').forEach(videoElement => {
      const src = videoElement.getAttribute('src');
      if (src && !src.startsWith('http:') && !src.startsWith('https:') && !src.startsWith('//') && !src.startsWith('data:')) {
        const blobUrl = getFileBlobUrl(src, files, entryPoint);
        if (blobUrl) videoElement.setAttribute('src', blobUrl);
      }
      videoElement.querySelectorAll('source[src]').forEach(sourceElement => {
        const sourceSrc = sourceElement.getAttribute('src');
        if (sourceSrc && !sourceSrc.startsWith('http:') && !sourceSrc.startsWith('https:') && !sourceSrc.startsWith('//') && !sourceSrc.startsWith('data:')) {
            const blobUrl = getFileBlobUrl(sourceSrc, files, entryPoint);
            if (blobUrl) sourceElement.setAttribute('src', blobUrl);
        }
      });
    });

    const head = doc.head || doc.createElement('head');
    if (!doc.head) doc.documentElement.prepend(head);
    
    const consoleScriptElement = doc.createElement('script');
    consoleScriptElement.textContent = scriptSetup;
    head.prepend(consoleScriptElement); 

    htmlContent = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
    return htmlContent;
  }, [files, entryPoint, scriptSetup]);

  const deviceStyle = DEVICE_DIMENSIONS[deviceView];

  return (
    <div className="w-full h-full flex justify-center items-center bg-transparent overflow-hidden p-1">
      <div
        className="overflow-hidden bg-surface-1 transition-all duration-300 ease-in-out border border-outline-variant rounded-lg shadow-md"
        style={{
          width: deviceStyle.width,
          height: deviceStyle.height,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <iframe
          srcDoc={srcDoc}
          title="App Preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          className="w-full h-full border-0"
          aria-label="Live preview of the generated application"
        />
      </div>
    </div>
  );
};
