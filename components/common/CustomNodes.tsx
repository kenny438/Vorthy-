import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getNodeDefinitionByType, NodeDefinition } from '../../types';

interface CustomNodeData {
  nodeType: string;
  onDataChange: (nodeId: string, field: string, value: any) => void;
  [key: string]: any;
}

const renderInputField = (
  nodeId: string,
  field: string,
  value: any,
  label: string,
  onDataChange: CustomNodeData['onDataChange'],
  typeOverride?: string
) => {
  const isTextArea = typeof value === 'string' && (value.length > 50 || field.toLowerCase().includes('text') || field.toLowerCase().includes('css'));
  const inputType = typeOverride || (typeof value === 'number' ? 'number' : 'text');
  
  const commonClass = "w-full p-1.5 border border-outline rounded-md font-sans text-xs bg-surface-2 text-text-primary placeholder-placeholder focus:ring-1 focus:ring-primary focus:border-primary";

  return (
    <div key={field} className="space-y-1">
      <label htmlFor={`${nodeId}-${field}`} className="text-xs font-medium text-text-secondary capitalize">{label}</label>
      {isTextArea ? (
        <textarea
          id={`${nodeId}-${field}`}
          value={value}
          onChange={(e) => onDataChange(nodeId, field, e.target.value)}
          placeholder={`Enter ${label}...`}
          className={`${commonClass} resize-y h-20`}
          aria-label={label}
        />
      ) : (
        <input
          type={inputType}
          id={`${nodeId}-${field}`}
          value={value}
          onChange={(e) => onDataChange(nodeId, field, e.target.value)}
          placeholder={`Enter ${label}...`}
          className={commonClass}
          aria-label={label}
        />
      )}
    </div>
  );
};

export const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ id, data, isConnectable }) => {
  const nodeDef = getNodeDefinitionByType(data.nodeType);

  if (!nodeDef) {
    return <div className="p-4 bg-error text-on-error rounded-md">Error: Unknown node type '{data.nodeType}'</div>;
  }
  
  const nodeColor = 
      nodeDef.category === 'html' ? '#4A90E2' : 
      nodeDef.category === 'css' ? '#F5A623' : 
      '#BD10E0'; // javascript

  return (
    <div
      className="bg-surface-1 border-2 rounded-lg shadow-md nowheel"
      style={{ borderColor: nodeColor, minWidth: 200, maxWidth: 300 }}
    >
      <div
        className="flex items-center p-2 rounded-t-md"
        style={{ backgroundColor: nodeColor }}
      >
        <span className="material-symbols-outlined text-lg mr-2 text-on-primary">{nodeDef.icon}</span>
        <strong className="text-on-primary text-sm font-semibold">{nodeDef.label}</strong>
      </div>
      <div className="p-3 text-xs space-y-2">
        <p className="text-xs text-text-secondary pb-1">{nodeDef.description}</p>
        {Object.entries(nodeDef.defaultData).map(([field, defaultValue]) => 
           renderInputField(id, field, data[field] ?? defaultValue, field, data.onDataChange)
        )}
      </div>

      {nodeDef.handles.map(handle => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          isConnectable={isConnectable}
          style={{ ...handle.style }}
          className="!w-3 !h-3"
        />
      ))}
    </div>
  );
};
