

import React, { useState, useEffect, useRef } from 'react';

interface AICodingEffectProps {
  isActive: boolean;
  userPrompt?: string;
}

const genericPseudoCodeLines = [
  "import { createComponent } from 'pixel-framework';",
  "const newApp = createComponent({",
  "  name: 'DynamicUI',",
  "  state: { count: 0, user: null },",
  "  template: `<div class='container'><h1>{{appName}}</h1><p>{{description}}</p></div>`,",
  "  methods: {",
  "    fetchData: async () => { /* ... */ },",
  "    incrementCounter: () => { this.state.count++; }",
  "  },",
  "  styles: `",
  "    .container { padding: 20px; background: #E8ECF2; }", // surface-3
  "    h1 { color: #0B57D0; }", // primary
  "  `",
  "});",
  "// Initializing router...",
  "Router.addRoute('/home', newApp);",
  "App.mount('#root');",
  "// Connecting to API_SERVICE...",
  "const data = await API_SERVICE.get('/data');",
  "if (data.status === 200) {",
  "  newApp.state.user = data.user;",
  "}",
  "// Applying user customizations...",
  "theme.apply('material_you_palette');",
  "Logger.info('App generation sequence complete.');",
  "Renderer.render(finalComponent);",
  "eventBus.emit('APP_READY');",
  "function processInput(input) {",
  "  const tokens = tokenize(input);",
  "  const ast = parse(tokens);",
  "  return evaluate(ast);",
  "}",
  "// Optimizing assets for production build...",
  "minifyCSS('style.output.css');",
  "uglifyJS('script.output.js');",
  "console.log('Build successful!');"
];

const generatePromptRelevantSnippets = (prompt: string): string[] => {
  const lowerPrompt = prompt.toLowerCase();
  let relevantSnippets: string[] = [];

  relevantSnippets.push(`// Analyzing request: "${prompt.substring(0, 30)}..."`);

  if (lowerPrompt.includes('react')) {
    relevantSnippets.push("import React, { useState, useEffect } from 'react';");
    relevantSnippets.push("const App = () => { /* ... React component ... */ };");
    relevantSnippets.push("ReactDOM.createRoot(document.getElementById('root')).render(<App />);");
  }
  if (lowerPrompt.includes('gsap') || lowerPrompt.includes('animation')) {
    relevantSnippets.push("import gsap from 'gsap';");
    relevantSnippets.push("gsap.timeline().to('.element', { x: 100, duration: 1 });");
    relevantSnippets.push("// Setting up scroll-triggered animations...");
  }
  if (lowerPrompt.includes('list') || lowerPrompt.includes('todo')) {
    relevantSnippets.push("const [items, setItems] = useState([]);");
    relevantSnippets.push("const addItem = (item) => setItems(prev => [...prev, item]);");
    relevantSnippets.push("items.map(item => <ListItem key={item.id} data={item} />);");
  }
  if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
    relevantSnippets.push("<form onSubmit={handleSubmit}>");
    relevantSnippets.push("  <input type='text' value={inputValue} onChange={handleChange} />");
    relevantSnippets.push("  <button type='submit'>Submit</button>");
    relevantSnippets.push("</form>");
  }
   if (lowerPrompt.includes('three.js') || lowerPrompt.includes('3d')) {
    relevantSnippets.push("import * as THREE from 'three';");
    relevantSnippets.push("const scene = new THREE.Scene();");
    relevantSnippets.push("const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);");
    relevantSnippets.push("renderer.render(scene, camera);");
  }

  if (relevantSnippets.length <= 1) { 
    relevantSnippets.push(...genericPseudoCodeLines.slice(0, 3)); 
  }
  
  while(relevantSnippets.length < 5 && genericPseudoCodeLines.length > 0) {
    relevantSnippets.push(genericPseudoCodeLines[Math.floor(Math.random() * genericPseudoCodeLines.length)]);
  }

  return relevantSnippets.sort(() => Math.random() - 0.5); 
};

export const AICodingEffect: React.FC<AICodingEffectProps> = ({ isActive, userPrompt }) => {
  const [activeCodeLines, setActiveCodeLines] = useState<string[]>(genericPseudoCodeLines);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineText, setCurrentLineText] = useState<string>('');
  const [charIndex, setCharIndex] = useState<number>(0);
  const [lineIndex, setLineIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userPrompt) {
      setActiveCodeLines(generatePromptRelevantSnippets(userPrompt));
    } else {
      setActiveCodeLines(genericPseudoCodeLines);
    }
    setVisibleLines([]);
    setCurrentLineText('');
    setCharIndex(0);
    setLineIndex(0);
  }, [userPrompt, isActive]);

  useEffect(() => {
    if (!isActive) return;
    if (activeCodeLines.length === 0) return;

    if (!currentLineText && charIndex === 0 && lineIndex === 0 && visibleLines.length === 0) {
      setCurrentLineText(activeCodeLines[0] || '');
    }
    
    const typingSpeed = 30; 
    const newLineDelay = 100;

    const intervalId = setInterval(() => {
      if (charIndex < currentLineText.length) {
        setCharIndex(prev => prev + 1);
      } else {
        if (currentLineText) {
          setVisibleLines(prev => [...prev, currentLineText].slice(Math.max(0, [...prev, currentLineText].length - 7)));
        }
        
        const nextLineIdx = (lineIndex + 1) % activeCodeLines.length;
        setLineIndex(nextLineIdx);
        setCurrentLineText(activeCodeLines[nextLineIdx] || '');
        setCharIndex(0);
      }
    }, charIndex < currentLineText.length ? typingSpeed : newLineDelay);

    return () => clearInterval(intervalId);
  }, [isActive, charIndex, currentLineText, lineIndex, activeCodeLines]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentLineText, charIndex]);
  
  if (!isActive) return null;

  return (
    <div 
      ref={containerRef} 
      className="w-full h-32 md:h-40 bg-code-bg p-3 rounded-md overflow-y-auto font-mono text-xs text-green-400 shadow-inner border border-code-border scrollbar-thin scrollbar-thumb-code-border scrollbar-track-transparent"
      aria-hidden="true"
    >
      {visibleLines.map((line, idx) => (
        <div key={idx} className="whitespace-pre-wrap break-all text-code-text-secondary">{line}</div>
      ))}
      {currentLineText && <div className="whitespace-pre-wrap break-all text-code-text">{currentLineText.substring(0, charIndex)}<span className="animate-pulse opacity-70">_</span></div>}
    </div>
  );
};
