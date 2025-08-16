import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  Node,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { NodePalette } from './common/NodePalette';
import { CustomNode } from './common/CustomNodes';
import { NODE_LIBRARY } from '../types';

type Theme = 'pixel' | 'terminal' | 'binary';

interface NodeBuilderViewProps {
  onGenerate: (nodes: any[], edges: any[]) => void;
  onExit: () => void;
  theme: Theme;
  isLoading: boolean;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 5 },
    data: { 
        nodeType: 'html_div',
        id: 'main-container',
        className: 'app',
        childrenText: ''
    },
  },
];

let id = 2;
const getId = () => `${id++}`;

export const NodeBuilderView: React.FC<NodeBuilderViewProps> = ({ onGenerate, onExit, theme, isLoading }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
  const nodeTypes = useMemo(() => ({ 
      custom: CustomNode,
  }), []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeDefinition = NODE_LIBRARY.find(n => n.type === type);
      if (!nodeDefinition) return;

      const newNode: Node = {
        id: getId(),
        type: 'custom',
        position,
        data: {
          nodeType: type,
          ...nodeDefinition.defaultData,
        },
      };
      
      // Auto-generate a unique ID for html elements if 'id' field exists
      if(newNode.data.id !== undefined) {
         newNode.data.id = `${nodeDefinition.label.toLowerCase().replace(' ', '-')}-${newNode.id}`;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );


  const handleNodeDataChange = (nodeId: string, field: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );
  };
  
  const handleGenerate = () => {
      // Pass nodes with the data change handler removed, as it's not serializable
      const serializableNodes = nodes.map(({ data, ...rest }) => ({
          ...rest,
          data: {
              ...data,
          }
      }));
      onGenerate(serializableNodes, edges);
  }

  // Inject the handler into node data for the custom node component
  const nodesWithHandler = useMemo(() => nodes.map(n => ({
      ...n,
      data: { ...n.data, onDataChange: handleNodeDataChange }
  })), [nodes]);

  const isMonospaceTheme = theme === 'terminal' || theme === 'binary';

  const getButtonClass = (variant: 'primary' | 'danger') => {
    let styles = "flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-1 transition-all duration-150 disabled:opacity-60 ";
    const shadow = isMonospaceTheme ? 'border-2' : 'shadow-md';
     switch(variant) {
        case 'primary': return styles + shadow + `bg-primary text-on-primary hover:bg-opacity-90 focus:ring-primary`;
        case 'danger': return styles + shadow + `bg-error-container text-on-error-container hover:bg-opacity-80 focus:ring-error`;
    }
    return styles;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-bg-main overflow-hidden">
      <header className="py-3 px-4 sm:px-6 bg-surface-1 sticky top-0 z-30 flex-shrink-0 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center">
              <span className="material-symbols-outlined text-3xl mr-3 text-primary">hub</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Visual Node Builder</h1>
                <p className="text-xs sm:text-sm text-text-secondary">Drag nodes, connect them, and describe their function to build your app.</p>
              </div>
          </div>
          <div className="flex items-center space-x-3">
              <button onClick={onExit} className={getButtonClass('danger')} disabled={isLoading}>
                  <span className="material-symbols-outlined text-lg mr-1.5">close</span>
                  Exit Builder
              </button>
              <button onClick={handleGenerate} className={getButtonClass('primary')} disabled={isLoading || nodes.length === 0}>
                  <span className="material-symbols-outlined text-lg mr-1.5">{ isLoading ? 'hourglass_top' : 'rocket_launch'}</span>
                  {isLoading ? 'Generating...' : 'Generate App'}
              </button>
          </div>
      </header>
       <ReactFlowProvider>
          <div className="flex-grow flex w-full h-full min-h-0" ref={reactFlowWrapper}>
            <NodePalette theme={theme} />
            <ReactFlow
              nodes={nodesWithHandler}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-surface-2"
            >
              <Controls />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
              <Background gap={isMonospaceTheme ? 16: 12} size={isMonospaceTheme ? 0.5 : 1} color={isMonospaceTheme ? 'var(--color-outline)' : 'var(--color-surface-3)'} />
            </ReactFlow>
          </div>
      </ReactFlowProvider>
    </div>
  );
};
