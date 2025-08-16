

import React, { useState, useEffect } from 'react';
import type { AIProvider, AIProviderModel, ApiKeyConfig, ModelDefinition } from '../../types';
import { getModelById, getModelsByProvider } from '../../types';

interface ApiKeyModalProps {
  provider: AIProvider;
  currentApiKey: string | null;
  currentModelId: AIProviderModel; // Changed to currentModelId
  onSave: (config: ApiKeyConfig) => void;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ provider, currentApiKey, currentModelId, onSave, onClose }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [selectedModelId, setSelectedModelId] = useState<AIProviderModel>(currentModelId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(currentApiKey || '');
    setSelectedModelId(currentModelId);
  }, [currentApiKey, currentModelId, provider]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API Key cannot be empty.');
      return;
    }
    setError(null);
    onSave({ provider, apiKey: apiKey.trim(), model: selectedModelId });
  };

  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  const modelOptions: ModelDefinition[] = getModelsByProvider(provider);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-main/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${provider}-apikey-modal-title`}
    >
      <div 
        className="bg-surface-1 border border-outline-variant rounded-xl shadow-xl max-w-md w-full p-6 sm:p-8 text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 id={`${provider}-apikey-modal-title`} className="text-xl sm:text-2xl font-semibold text-text-primary">
            Configure {providerName} API
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-1"
            aria-label={`Close ${providerName} API configuration`}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor={`${provider}-apiKey`} className="block text-sm font-medium text-text-secondary mb-1">
              {providerName} API Key
            </label>
            <input
              type="password"
              id={`${provider}-apiKey`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-surface-2 text-text-primary placeholder-placeholder rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-sm transition-colors"
              placeholder={`Enter your ${providerName} API Key`}
              aria-describedby={error ? `${provider}-apikey-error` : undefined}
            />
            {error && <p id={`${provider}-apikey-error`} className="mt-1.5 text-xs text-error">{error}</p>}
          </div>
          <div>
            <label htmlFor={`${provider}-model`} className="block text-sm font-medium text-text-secondary mb-1">
              Select Model for {providerName}
            </label>
            <select
              id={`${provider}-model`}
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value as AIProviderModel)}
              className="w-full px-3 py-2.5 text-sm bg-surface-2 text-text-primary rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-sm transition-colors appearance-none bg-no-repeat bg-right pr-8"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2374777F'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E")`, backgroundSize: '1.5em', backgroundPositionX: 'calc(100% - 0.5rem)' }}
            >
              {modelOptions.map(model => (
                <option key={model.id} value={model.id}>{model.name} {model.isPro ? '(Pro)' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row-reverse sm:items-center sm:justify-start gap-3">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-medium text-sm rounded-full shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-1 transition-colors"
          >
            Save Configuration
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-surface-2 text-text-secondary font-medium text-sm rounded-full shadow-sm hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
