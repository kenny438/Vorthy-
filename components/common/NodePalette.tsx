import React, { useState } from 'react';
import { NODE_LIBRARY, NodeCategory } from '../../types';

interface NodePaletteProps {
  theme: 'pixel' | 'terminal' | 'binary';
}

const categories: { id: NodeCategory; label: string; icon: string }[] = [
    { id: 'html', label: 'HTML', icon: 'code' },
    { id: 'css', label: 'CSS', icon: 'palette' },
    { id: 'javascript', label: 'JavaScript', icon: 'bolt' },
];

export const NodePalette: React.FC<NodePaletteProps> = ({ theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<NodeCategory>('html');

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const isMonospaceTheme = theme === 'terminal' || theme === 'binary';

    const filteredNodes = NODE_LIBRARY.filter(node =>
        node.category === activeCategory &&
        (node.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
         node.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <aside className="w-64 bg-surface-1 p-3 border-r border-outline-variant flex-shrink-0 flex flex-col space-y-3 overflow-y-hidden">
            <div className="flex-shrink-0">
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-2 text-text-primary placeholder-placeholder rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-sm transition-colors"
                />
            </div>
            <div className="flex-shrink-0 flex items-center justify-center bg-surface-2 rounded-lg p-1">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-1 text-sm font-semibold p-2 rounded-md transition-colors duration-150 flex items-center justify-center
                          ${activeCategory === cat.id ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-3'}`}
                        title={cat.label}
                    >
                        <span className="material-symbols-outlined text-lg mr-1.5">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
                {filteredNodes.map((node) => (
                    <div
                        key={node.type}
                        onDragStart={(event) => onDragStart(event, node.type)}
                        draggable
                        className="flex items-center p-2.5 text-left text-xs font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface-1 cursor-grab bg-surface-2 hover:bg-surface-3 border border-outline-variant"
                    >
                        <span className="material-symbols-outlined text-base mr-2 text-primary">{node.icon}</span>
                        <span className="text-text-primary">{node.label}</span>
                    </div>
                ))}
                 {filteredNodes.length === 0 && (
                    <p className="text-center text-xs text-placeholder p-4">No nodes found for '{searchTerm}' in {activeCategory}.</p>
                 )}
            </div>
            <div className="flex-shrink-0 pt-2 text-xs text-placeholder border-t border-outline-variant">
                <p><strong className="text-text-secondary">How to use:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Drag a node from the list onto the canvas.</li>
                    <li>Connect nodes by dragging between the colored circles.</li>
                    <li>Fill in the fields on each node to define its behavior.</li>
                </ul>
            </div>
        </aside>
    );
};
