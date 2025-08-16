

import React, { useState, useRef, useEffect } from 'react';
import type { AIProvider, AIProviderModel, ModelDefinition } from '../../types';
import { getModelById, ALL_MODELS_GROUPED } from '../../types';

interface ModelSelectorDropdownProps {
  currentProvider: AIProvider;
  currentModelId: AIProviderModel;
  onSelectModel: (provider: AIProvider, modelId: AIProviderModel) => void;
  disabled?: boolean;
}

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  currentProvider,
  currentModelId,
  onSelectModel,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = getModelById(currentModelId);
  const buttonText = currentModel ? currentModel.name : 'Select Model';

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (provider: AIProvider, modelId: AIProviderModel) => {
    onSelectModel(provider, modelId);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="flex items-center justify-between w-full sm:w-auto px-3 py-1.5 text-xs font-medium bg-surface-1 text-text-primary rounded-md shadow-sm border border-outline-variant hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface-1 disabled:opacity-60"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="truncate max-w-[120px] sm:max-w-[150px]">{buttonText}</span>
          <span className="material-symbols-outlined text-lg ml-1 leading-none transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
            expand_more
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-20 mt-1 w-72 origin-top-right rounded-lg bg-surface-1 shadow-xl ring-1 ring-outline ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
            {ALL_MODELS_GROUPED.map(group => (
              <div key={group.provider}>
                <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {group.name}
                </div>
                {group.models.map((model: ModelDefinition) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model.provider, model.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-start justify-between hover:bg-surface-2 hover:text-text-primary focus:bg-surface-2 focus:outline-none
                      ${model.id === currentModelId ? 'bg-primary-container/30 text-primary' : 'text-text-secondary'}`}
                    role="menuitem"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium text-text-primary">{model.name}</span>
                        {model.isPro && (
                          <span className="ml-2 px-1.5 py-0.5 text-xxs font-semibold bg-secondary text-on-secondary rounded-sm">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 text-xs ${model.id === currentModelId ? 'text-primary/80' : 'text-placeholder'}`}>
                        {model.description}
                      </p>
                    </div>
                    {model.id === currentModelId && (
                      <span className="material-symbols-outlined text-xl text-primary ml-2 flex-shrink-0">
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
