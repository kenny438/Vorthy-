interface Node {
  id: string;
  type: string; // e.g., 'custom'
  data: {
    nodeType: string; // e.g., 'html_div', 'js_action_alert'
    [key: string]: any;
  };
  [key: string]: any;
}

interface Edge {
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  [key: string]: any;
}

const findNodeById = (nodes: Node[], id: string): Node | undefined => nodes.find(n => n.id === id);

// Recursive function to build a string representation of the HTML tree
const buildHtmlTree = (nodeId: string, nodes: Node[], edges: Edge[], indent: string): string => {
  const node = findNodeById(nodes, nodeId);
  if (!node || !node.data.nodeType.startsWith('html_')) return '';

  let attributes = '';
  if (node.data.id) attributes += ` id="${node.data.id}"`;
  if (node.data.className) attributes += ` class="${node.data.className}"`;
  
  // Add other specific attributes
  if (node.data.src) attributes += ` src="${node.data.src}"`;
  if (node.data.alt) attributes += ` alt="${node.data.alt}"`;
  if (node.data.href) attributes += ` href="${node.data.href}"`;
  if (node.data.forId) attributes += ` for="${node.data.forId}"`;
  if (node.data.placeholder) attributes += ` placeholder="${node.data.placeholder}"`;
  if (node.data.type) attributes += ` type="${node.data.type}"`;
  if (node.data.value) attributes += ` value="${node.data.value}"`;
  if (node.data.controls) attributes += ` controls`;


  let treeString = `${indent}<${node.data.tag}${attributes}>`;

  const hasChildren = edges.some(e => e.source === nodeId && e.sourceHandle === 'children');

  if (hasChildren) {
    treeString += '\n';
    const childEdges = edges.filter(e => e.source === nodeId && e.sourceHandle === 'children');
    for (const edge of childEdges) {
      treeString += buildHtmlTree(edge.target, nodes, edges, indent + '  ');
    }
    treeString += `${indent}</${node.data.tag}>\n`;
  } else {
    treeString += `${node.data.childrenText || ''}</${node.data.tag}>\n`;
  }
  
  return treeString;
}

// Function to build CSS rules from connected style nodes
const buildCssRules = (nodes: Node[], edges: Edge[]): string => {
    let cssString = "/* --- CSS Styles --- */\n";
    cssString += `body {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n  margin: 0;\n  padding: 2rem;\n  background-color: #f8f9fa;\n}\n\n`;
    
    const styledHtmlNodes = nodes.filter(n => 
        n.data.nodeType.startsWith('html_') &&
        n.data.id &&
        edges.some(e => e.target === n.id && e.targetHandle === 'style')
    );

    if (styledHtmlNodes.length === 0) {
        cssString += "/* No CSS rules defined in the visual plan. */\n";
        return cssString;
    }

    for (const htmlNode of styledHtmlNodes) {
        const styleEdges = edges.filter(e => e.target === htmlNode.id && e.targetHandle === 'style');
        if (styleEdges.length === 0) continue;

        const properties: string[] = [];

        for (const edge of styleEdges) {
            const styleNode = findNodeById(nodes, edge.source);
            if (styleNode && styleNode.data.nodeType.startsWith('css_')) {
                const propName = styleNode.data.property;
                const propValue = styleNode.data.value;
                if (propName && propValue) {
                    properties.push(`  ${propName}: ${propValue};`);
                }
            }
        }
        
        if (properties.length > 0) {
            cssString += `#${htmlNode.data.id} {\n`;
            cssString += properties.join('\n');
            cssString += `\n}\n\n`;
        }
    }
    
    return cssString;
}

// Function to build JavaScript event listeners and actions from the graph
const buildJsLogic = (nodes: Node[], edges: Edge[], indent = '  '): string => {
    let jsString = "";
    
    // Find all event nodes
    const eventNodes = nodes.filter(n => n.data.nodeType.startsWith('js_event_'));

    for (const eventNode of eventNodes) {
        const eventType = eventNode.data.nodeType.replace('js_event_on_', ''); // e.g., 'click', 'load'

        const buildActionLogic = (startActionNodeId: string): string => {
            let actionJs = '';
            let currentNodeId: string | null = startActionNodeId;
            
            while(currentNodeId) {
                const actionNode = findNodeById(nodes, currentNodeId);
                if (!actionNode) break;

                switch(actionNode.data.nodeType) {
                    case 'js_action_alert':
                        actionJs += `${indent.repeat(2)}alert('${actionNode.data.message}');\n`;
                        break;
                    case 'js_action_console_log':
                        actionJs += `${indent.repeat(2)}console.log('${actionNode.data.message}');\n`;
                        break;
                    case 'js_action_toggle_class':
                        actionJs += `${indent.repeat(2)}document.querySelector('${actionNode.data.selector}')?.classList.toggle('${actionNode.data.className}');\n`;
                        break;
                    case 'js_action_add_class':
                        actionJs += `${indent.repeat(2)}document.querySelector('${actionNode.data.selector}')?.classList.add('${actionNode.data.className}');\n`;
                        break;
                    case 'js_action_remove_class':
                         actionJs += `${indent.repeat(2)}document.querySelector('${actionNode.data.selector}')?.classList.remove('${actionNode.data.className}');\n`;
                        break;
                    case 'js_action_set_text':
                        actionJs += `${indent.repeat(2)}document.querySelector('${actionNode.data.selector}').textContent = '${actionNode.data.text}';\n`;
                        break;
                    case 'js_action_set_attribute':
                         actionJs += `${indent.repeat(2)}document.querySelector('${actionNode.data.selector}')?.setAttribute('${actionNode.data.attribute}', '${actionNode.data.value}');\n`;
                        break;
                    case 'js_action_set_css_property':
                        actionJs += `${indent.repeat(2)}document.querySelector('${actionNode.data.selector}').style.${actionNode.data.property} = '${actionNode.data.value}';\n`;
                        break;
                    case 'js_action_fetch_api':
                         actionJs += `${indent.repeat(2)}fetch('${actionNode.data.url}').then(res => res.json()).then(data => console.log(data));\n`;
                        break;
                    case 'js_action_redirect':
                        actionJs += `${indent.repeat(2)}window.location.href = '${actionNode.data.url}';\n`;
                        break;
                    case 'js_action_set_timeout':
                        const nextActionForTimeout = edges.find(e => e.source === actionNode.id && e.sourceHandle === 'action_out');
                        if (nextActionForTimeout) {
                             const nextActionNodeId = nextActionForTimeout.target;
                             actionJs += `${indent.repeat(2)}setTimeout(() => {\n${buildActionLogic(nextActionNodeId)}${indent.repeat(2)}}, ${actionNode.data.delay});\n`;
                             // Since the rest of the chain is inside the timeout, we stop this loop.
                             currentNodeId = null;
                             continue;
                        }
                        break;
                }

                // Move to next action in the chain
                const nextEdge = edges.find(e => e.source === currentNodeId && e.sourceHandle === 'action_out');
                currentNodeId = nextEdge ? nextEdge.target : null;
            }
            return actionJs;
        };

        const firstActionEdges = edges.filter(e => e.source === eventNode.id && e.sourceHandle === 'action_out');
        const actionLogic = firstActionEdges.map(edge => buildActionLogic(edge.target)).join('');
        
        if (!actionLogic) continue;

        if (eventType === 'load') {
            jsString += `\n${indent}/* On page load actions */\n`;
            jsString += actionLogic;
        } else {
            const elementEdge = edges.find(e => e.target === eventNode.id && e.targetHandle === 'element_in');
            if (!elementEdge) continue;

            const htmlNode = findNodeById(nodes, elementEdge.source);
            if (!htmlNode || !htmlNode.data.id) continue;
            
            jsString += `\n${indent}const element_${htmlNode.data.id.replace(/-/g, '_')} = document.getElementById('${htmlNode.data.id}');\n`;
            jsString += `${indent}if (element_${htmlNode.data.id.replace(/-/g, '_')}) {\n`;
            jsString += `${indent}  element_${htmlNode.data.id.replace(/-/g, '_')}.addEventListener('${eventType}', () => {\n`;
            jsString += actionLogic;
            jsString += `${indent}  });\n${indent}}\n`;
        }
    }
    return jsString;
}


export const generatePromptFromNodes = (nodes: Node[], edges: Edge[]): string => {
  let prompt = "Generate a comprehensive, single-page web application based on the following detailed plan. The application's structure, styling, and interactivity are explicitly defined below. Create three files: `public/index.html`, `public/style.css`, and `public/script.js`.\n\n";

  const rootNodes = nodes.filter(n =>
    n.data.nodeType.startsWith('html_') &&
    !edges.some(e => e.target === n.id && e.targetHandle === 'parent')
  );

  if (rootNodes.length === 0) {
    return "The visual plan must contain at least one root HTML node (a node without a parent connection) to begin generation.";
  }

  // --- Build HTML ---
  let htmlContent = "<!-- --- HTML Structure --- -->\n";
  for (const rootNode of rootNodes) {
      htmlContent += buildHtmlTree(rootNode.id, nodes, edges, '');
  }
  prompt += "### File: `public/index.html`\n";
  prompt += "This file should contain the following HTML structure. It must link to `./style.css` and `./script.js`.\n";
  prompt += "```html\n" + htmlContent + "```\n\n";

  // --- Build CSS ---
  const cssContent = buildCssRules(nodes, edges);
  prompt += "### File: `public/style.css`\n";
  prompt += "This file should contain the following CSS rules.\n";
  prompt += "```css\n" + cssContent + "```\n\n";

  // --- Build JS ---
  const jsLogic = buildJsLogic(nodes, edges);
  let jsContent = "/* --- JavaScript Logic --- */\n";
  if (jsLogic.trim()) {
    jsContent += "document.addEventListener('DOMContentLoaded', () => {\n";
    jsContent += jsLogic;
    jsContent += "});\n";
  } else {
    jsContent += "// No JavaScript logic defined in the visual plan.\n"
  }
  prompt += "### File: `public/script.js`\n";
  prompt += "This file should contain the following JavaScript logic.\n";
  prompt += "```javascript\n" + jsContent + "```\n\n";
  
  prompt += "Please generate the three files exactly as described. The application should be a polished, functional, and visually appealing translation of this plan. Ensure the final result is a 'SOOOOOOO GOOOOOD' quality product.";

  return prompt;
};