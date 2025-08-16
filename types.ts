
import { Position } from 'reactflow';

export interface GeneratedFile {
  path: string; // e.g., "public/index.html", "src/components/Button.tsx", "assets/logo.svg"
  content: string; // The actual file content
}

export interface VideoGenRequest {
  prompt: string; // Detailed prompt for the video generation model
  targetFilePath: string; // e.g., "public/assets/videos/intro.mp4"
}

export interface GeneratedAppPayload {
  files: GeneratedFile[];  // Array of all generated files
  entryPoint?: string;     // Suggested entry point, e.g., "public/index.html"
  appName?: string;        // Optional app name suggested by AI
  appDescription?: string; // Optional brief description by AI
  videoGenerationRequests?: VideoGenRequest[]; // Optional array of video generation requests
}

// New types for web search grounding
export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GenerationResult {
  payload: GeneratedAppPayload;
  sources?: GroundingSource[];
}

// This is the expected structure from Gemini API for code generation
export type GeminiResponse = GeneratedAppPayload;

// Payload for the new plan generation step
export interface GeneratedPlanPayload {
  plan: string; // The detailed project plan in Markdown format
}


export interface TerminalMessage {
  id: string; // Unique ID for key prop
  level: 'log' | 'warn' | 'error' | 'info' | 'debug' | 'system';
  payload: any[];
  timestamp: string;
  sources?: GroundingSource[];
}

export type DeviceView = 'desktop' | 'tablet' | 'phone' | 'tv';

export interface UploadedFile {
  name: string;
  mimeType: string;
  base64Data: string; // Base64 string without the data:mime/type;base64, prefix
  dataURL?: string; // Full data URL, optional, for client-side preview
}

export type CreationMode =
  | 'app'
  | 'component'
  | 'animation'
  | 'landing_page'
  | 'interactive_element'
  | 'data_viz';

export const creationModeToLabel = (mode: CreationMode): string => {
  switch (mode) {
    case 'app': return 'App';
    case 'component': return 'Component';
    case 'animation': return 'Animation';
    case 'landing_page': return 'Landing Page';
    case 'interactive_element': return 'Interactive Element';
    case 'data_viz': return 'Data Visualization';
    default: return 'Project';
  }
};

// Context to hold all parameters for a generation request during the planning phase
export interface GenerationContext {
  prompt: string;
  creationMode: CreationMode;
  uploadedFile: UploadedFile | null;
  browserInspirationUrl: string | null;
  figmaInspiration: string | null;
  aiProvider: AIProvider;
  modelId: AIProviderModel;
}

export type AppView = 'landing' | 'planning' | 'iterating' | 'node_builder';


export interface InspirationSource {
  type: 'browser' | 'figma';
  value: string; // URL or Figma description
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'mistral' | 'xai' | 'cohere' | 'meta';

// Specific model types
export type GeminiModel = 'gemini-2.5-flash'; // Per strict guidelines
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4.5-pymntscset' | 'o1-preview' | 'o1-mini';
export type AnthropicModel = 'claude-3-5-sonnet-20240620' | 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
export type MistralModel = 'mistral-large-2' | 'mistral-large-latest' | 'mistral-medium-latest' | 'mistral-small-latest' | 'mistral-7b' | 'mixtral-8x7b' | 'mixtral-8x22b' | 'mistral-medium-3';
export type XAIModel = 'grok-2'| 'grok-1.5' | 'grok-1' | 'grok-2-mini';
export type CohereModel = 'command-r-plus' | 'command-r' | 'command' | 'command-light';
export type MetaModel = 'llama-3.1-405b' | 'llama-3.1-70b' | 'llama-3.1-8b' | 'llama-3-70b' | 'llama-3-8b' | 'llama-2-70b' | 'llama-2-13b' | 'llama-2-7b';

export type AIProviderModel = GeminiModel | OpenAIModel | AnthropicModel | MistralModel | XAIModel | CohereModel | MetaModel;


export interface ModelDefinition {
  id: AIProviderModel;
  name: string;
  provider: AIProvider;
  description: string;
  isPro?: boolean;
}

export const GEMINI_MODELS: ModelDefinition[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Fast and versatile for a variety of tasks. (Recommended)' },
  // Other Gemini models from user list (e.g., Gemini 1.5 Pro, PaLM 2) are not included here to adhere to strict usage guidelines for API calls.
];

export const OPENAI_MODELS: ModelDefinition[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'OpenAI\'s most advanced multimodal model.', isPro: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'openai', description: 'A smaller, faster, and cheaper version of GPT-4o.', isPro: false },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'Powerful model with large context window.', isPro: true },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', description: 'Previous generation leading model.', isPro: true },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: 'Fast and cost-effective model for general tasks.' },
  { id: 'gpt-4.5-pymntscset', name: 'GPT-4.5 PymntsCSET', provider: 'openai', description: 'Recently released, specialized model.', isPro: true }, // Assuming pro
  { id: 'o1-preview', name: 'o1-preview', provider: 'openai', description: 'Preview model for specific use cases.', isPro: true },
  { id: 'o1-mini', name: 'o1-mini', provider: 'openai', description: 'Miniature preview model.', isPro: false },
];

export const ANTHROPIC_MODELS: ModelDefinition[] = [
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Anthropic\'s most intelligent model to date, excelling at reasoning and coding.', isPro: true },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', description: 'Highest-performing model for highly complex tasks.', isPro: true },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', description: 'Balanced model for intelligence and speed.' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', description: 'Fastest model for near-instant responsiveness.' },
];

export const MISTRAL_MODELS: ModelDefinition[] = [
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'mistral', description: 'High-performance sparse mixture-of-experts model.', isPro: true },
  { id: 'mistral-large-2', name: 'Mistral Large 2', provider: 'mistral', description: 'Latest flagship large model from Mistral AI.', isPro: true },
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral', description: 'Powerful, large-scale model for complex tasks.' , isPro: true },
  { id: 'mistral-medium-3', name: 'Mistral Medium 3', provider: 'mistral', description: 'Newest medium model, claims leading performance for price.', isPro: true },
  { id: 'mistral-medium-latest', name: 'Mistral Medium', provider: 'mistral', description: 'Balanced performance for a variety of applications.' },
  { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'mistral', description: 'Optimized for low-latency and efficiency.' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'mistral', description: 'Popular and efficient mixture-of-experts model.' },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'mistral', description: 'Highly capable small model, excellent for its size.' },
];

export const XAI_MODELS: ModelDefinition[] = [
  { id: 'grok-2', name: 'Grok-2', provider: 'xai', description: 'Next generation model from xAI.', isPro: true },
  { id: 'grok-1.5', name: 'Grok-1.5', provider: 'xai', description: 'Advanced reasoning and problem-solving capabilities.', isPro: true },
  { id: 'grok-1', name: 'Grok-1', provider: 'xai', description: 'Large model with real-time information access training.' },
  { id: 'grok-2-mini', name: 'Grok-2 mini', provider: 'xai', description: 'A smaller, more efficient version of Grok-2.' },
];

export const COHERE_MODELS: ModelDefinition[] = [
  { id: 'command-r-plus', name: 'Command R+', provider: 'cohere', description: 'State-of-the-art model for enterprise-grade workloads.', isPro: true },
  { id: 'command-r', name: 'Command R', provider: 'cohere', description: 'Scalable model balancing performance and efficiency.' },
  { id: 'command', name: 'Command', provider: 'cohere', description: 'Flagship text generation model.' },
  { id: 'command-light', name: 'Command Light', provider: 'cohere', description: 'Lightweight and fast version for quick tasks.' },
];

export const META_MODELS: ModelDefinition[] = [
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'meta', description: 'Largest Llama 3.1 model, state-of-the-art performance.', isPro: true },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'meta', description: '70B parameter Llama 3.1 model.' , isPro: true},
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'meta', description: '8B parameter Llama 3.1 model, efficient.' },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'meta', description: 'Previous generation 70B Llama model.', isPro: true },
  { id: 'llama-3-8b', name: 'Llama 3 8B', provider: 'meta', description: 'Previous generation 8B Llama model.' },
  { id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'meta', description: 'Llama 2 model with 70B parameters.' },
  { id: 'llama-2-13b', name: 'Llama 2 13B', provider: 'meta', description: 'Llama 2 model with 13B parameters.' },
  { id: 'llama-2-7b', name: 'Llama 2 7B', provider: 'meta', description: 'Llama 2 model with 7B parameters.' },
];


export const ALL_MODELS_GROUPED: { provider: AIProvider; name: string; models: ModelDefinition[] }[] = [
    { provider: 'gemini', name: 'Google Gemini', models: GEMINI_MODELS },
    { provider: 'openai', name: 'OpenAI', models: OPENAI_MODELS },
    { provider: 'anthropic', name: 'Anthropic', models: ANTHROPIC_MODELS },
    { provider: 'mistral', name: 'Mistral AI', models: MISTRAL_MODELS },
    { provider: 'xai', name: 'xAI (Grok)', models: XAI_MODELS },
    { provider: 'cohere', name: 'Cohere', models: COHERE_MODELS },
    { provider: 'meta', name: 'Meta Llama', models: META_MODELS },
];

export const getModelById = (id: AIProviderModel): ModelDefinition | undefined =>
  ALL_MODELS_GROUPED.flatMap(group => group.models).find(m => m.id === id);

export const getModelsByProvider = (provider: AIProvider): ModelDefinition[] => {
  const group = ALL_MODELS_GROUPED.find(g => g.provider === provider);
  return group ? group.models : [];
};

export const getDefaultModelForProvider = (provider: AIProvider): AIProviderModel => {
    switch (provider) {
        case 'gemini': return 'gemini-2.5-flash';
        case 'openai': return 'gpt-4o';
        case 'anthropic': return 'claude-3-5-sonnet-20240620';
        case 'mistral': return 'mixtral-8x22b';
        case 'xai': return 'grok-2';
        case 'cohere': return 'command-r-plus';
        case 'meta': return 'llama-3.1-405b';
        default: return 'gemini-2.5-flash'; // Fallback
    }
};

export const getCurrentModelDefinition = (
  provider: AIProvider,
  geminiModelId: GeminiModel,
  openaiModelId: OpenAIModel,
  anthropicModelId: AnthropicModel,
  mistralModelId: MistralModel,
  xaiModelId: XAIModel,
  cohereModelId: CohereModel,
  metaModelId: MetaModel
): ModelDefinition | undefined => {
  let modelId: AIProviderModel;
  switch (provider) {
    case 'gemini': modelId = geminiModelId; break;
    case 'openai': modelId = openaiModelId; break;
    case 'anthropic': modelId = anthropicModelId; break;
    case 'mistral': modelId = mistralModelId; break;
    case 'xai': modelId = xaiModelId; break;
    case 'cohere': modelId = cohereModelId; break;
    case 'meta': modelId = metaModelId; break;
    default: return undefined;
  }
  return getModelById(modelId);
};


export interface Project {
  id: string; // Unique ID for the project
  appName: string;
  appDescription: string;
  files: GeneratedFile[]; // All project files
  entryPoint: string; // Main HTML file for preview, e.g., "public/index.html"
  creationMode: CreationMode; // The mode used to create/last modify this project
  lastSaved: string; // ISO string date
  aiProvider: AIProvider;
  aiModel: AIProviderModel;
}

export interface ApiKeyConfig {
  provider: AIProvider;
  apiKey: string;
  model: AIProviderModel;
}

// === NEW VISUAL NODE BUILDER TYPES ===

export type NodeCategory = 'html' | 'css' | 'javascript';

export interface NodeDefinition {
  type: string; // globally unique type, e.g., 'html_h1', 'js_event_onclick'
  label: string;
  category: NodeCategory;
  icon: string; // Material Symbols icon name
  description: string;
  defaultData: Record<string, any>;
  handles: { type: 'source' | 'target'; position: Position; id: string; style?: React.CSSProperties }[];
}

const HANDLE_STYLE = {
  htmlOut: { background: '#50E3C2' }, // Green for HTML structure/content flow
  styleIn: { background: '#F5A623', left: '-6px' },   // Orange for styling
  styleOut: { background: '#F5A623' },
  eventOut: { background: '#BD10E0', right: '-6px' }, // Purple for events
  actionIn: { background: '#BD10E0' }, // Purple for actions
  actionOut: { background: '#BD10E0', bottom: '-6px', },
};

const HTML_HANDLES = {
  parent: { type: 'target', position: Position.Top, id: 'parent' },
  children: { type: 'source', position: Position.Bottom, id: 'children', style: HANDLE_STYLE.htmlOut },
  style: { type: 'target', position: Position.Left, id: 'style', style: HANDLE_STYLE.styleIn },
  event: { type: 'source', position: Position.Right, id: 'event', style: HANDLE_STYLE.eventOut },
} as const;

const CSS_HANDLE_OUT = { type: 'source', position: Position.Right, id: 'style_out', style: HANDLE_STYLE.styleOut } as const;

const JS_EVENT_HANDLES = {
  elementIn: { type: 'target', position: Position.Left, id: 'element_in', style: HANDLE_STYLE.eventOut },
  actionOut: { type: 'source', position: Position.Bottom, id: 'action_out', style: HANDLE_STYLE.actionOut },
} as const;

const JS_ACTION_HANDLE_IN = { type: 'target', position: Position.Top, id: 'action_in', style: HANDLE_STYLE.actionIn } as const;
const JS_ACTION_HANDLE_OUT = { type: 'source', position: Position.Bottom, id: 'action_out', style: HANDLE_STYLE.actionOut } as const;


// --- NODE LIBRARY ---
const HTML_NODES: NodeDefinition[] = [
    // Containers
    { type: 'html_div', label: 'Div Container', category: 'html', icon: 'check_box_outline_blank', description: 'Generic container.', defaultData: { tag: 'div', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_span', label: 'Span', category: 'html', icon: 'short_text', description: 'Inline text container.', defaultData: { tag: 'span', id: '', className: '', childrenText: 'span text' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_header', label: 'Header', category: 'html', icon: 'web_asset', description: 'Header for a page/section.', defaultData: { tag: 'header', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_footer', label: 'Footer', category: 'html', icon: 'web_asset_off', description: 'Footer for a page/section.', defaultData: { tag: 'footer', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_main', label: 'Main', category: 'html', icon: 'square', description: 'Main content of the body.', defaultData: { tag: 'main', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_nav', label: 'Nav', category: 'html', icon: 'menu', description: 'Navigation links container.', defaultData: { tag: 'nav', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_section', label: 'Section', category: 'html', icon: 'view_agenda', description: 'A thematic section.', defaultData: { tag: 'section', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_article', label: 'Article', category: 'html', icon: 'article', description: 'A self-contained article.', defaultData: { tag: 'article', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_aside', label: 'Aside', category: 'html', icon: 'view_sidebar', description: 'Content aside from main.', defaultData: { tag: 'aside', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },

    // Text Content
    ...[1, 2, 3, 4, 5, 6].map(level => ({ type: `html_h${level}`, label: `Header ${level}`, category: 'html' as NodeCategory, icon: `format_h${level}`, description: `Level ${level} heading.`, defaultData: { tag: `h${level}`, id: '', className: '', childrenText: `Heading ${level}` }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] })),
    { type: 'html_p', label: 'Paragraph', category: 'html', icon: 'segment', description: 'A paragraph of text.', defaultData: { tag: 'p', id: '', className: '', childrenText: 'Lorem ipsum...' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_a', label: 'Link', category: 'html', icon: 'link', description: 'A hyperlink.', defaultData: { tag: 'a', id: '', className: '', childrenText: 'Click here', href: '#' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_blockquote', label: 'Blockquote', category: 'html', icon: 'format_quote', description: 'A quote section.', defaultData: { tag: 'blockquote', id: '', className: '', childrenText: 'A famous quote.' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style] },
    { type: 'html_pre', label: 'Preformatted', category: 'html', icon: 'code_blocks', description: 'Preformatted text block.', defaultData: { tag: 'pre', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style] },
    { type: 'html_code', label: 'Code', category: 'html', icon: 'data_object', description: 'Inline code snippet.', defaultData: { tag: 'code', id: '', className: '', childrenText: 'const x = 1;' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style] },
    
    // Lists
    { type: 'html_ul', label: 'Unordered List', category: 'html', icon: 'format_list_bulleted', description: 'A bulleted list.', defaultData: { tag: 'ul', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style] },
    { type: 'html_ol', label: 'Ordered List', category: 'html', icon: 'format_list_numbered', description: 'A numbered list.', defaultData: { tag: 'ol', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style] },
    { type: 'html_li', label: 'List Item', category: 'html', icon: 'list_item', description: 'An item in a list.', defaultData: { tag: 'li', id: '', className: '', childrenText: 'List item' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },

    // Forms
    { type: 'html_form', label: 'Form', category: 'html', icon: 'assignment', description: 'A container for form inputs.', defaultData: { tag: 'form', id: '', className: '' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.children, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_input_text', label: 'Text Input', category: 'html', icon: 'edit', description: 'A text input field.', defaultData: { tag: 'input', type: 'text', id: '', className: '', placeholder: 'Enter text...' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_label', label: 'Label', category: 'html', icon: 'label', description: 'A label for a form input.', defaultData: { tag: 'label', id: '', className: '', forId: '', childrenText: 'My Label' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style] },
    { type: 'html_textarea', label: 'Textarea', category: 'html', icon: 'notes', description: 'A multiline text input.', defaultData: { tag: 'textarea', id: '', className: '', placeholder: 'Enter details...' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_button', label: 'Button', category: 'html', icon: 'smart_button', description: 'An interactive button.', defaultData: { tag: 'button', id: '', className: '', childrenText: 'Click Me' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_input_submit', label: 'Submit Button', category: 'html', icon: 'send', description: 'A form submission button.', defaultData: { tag: 'input', type: 'submit', id: '', className: '', value: 'Submit' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },

    // Media
    { type: 'html_img', label: 'Image', category: 'html', icon: 'image', description: 'An image element.', defaultData: { tag: 'img', id: '', className: '', src: 'https://source.unsplash.com/random/200x200', alt: 'A random image' }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style, HTML_HANDLES.event] },
    { type: 'html_video', label: 'Video', category: 'html', icon: 'videocam', description: 'A video player.', defaultData: { tag: 'video', id: '', className: '', src: '', controls: true }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style] },
    { type: 'html_audio', label: 'Audio', category: 'html', icon: 'audiotrack', description: 'An audio player.', defaultData: { tag: 'audio', id: '', className: '', src: '', controls: true }, handles: [HTML_HANDLES.parent, HTML_HANDLES.style] },
];

const CSS_NODES: NodeDefinition[] = [
    // Layout
    { type: 'css_display', label: 'Display', category: 'css', icon: 'grid_view', description: 'Sets element display type.', defaultData: { property: 'display', value: 'block' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_position', label: 'Position', category: 'css', icon: 'control_camera', description: 'Sets element positioning.', defaultData: { property: 'position', value: 'relative' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_top', label: 'Top', category: 'css', icon: 'arrow_upward', description: 'Sets top position.', defaultData: { property: 'top', value: '0px' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_left', label: 'Left', category: 'css', icon: 'arrow_back', description: 'Sets left position.', defaultData: { property: 'left', value: '0px' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_z_index', label: 'Z-Index', category: 'css', icon: 'layers', description: 'Sets stack order.', defaultData: { property: 'z-index', value: '1' }, handles: [CSS_HANDLE_OUT] },

    // Box Model
    { type: 'css_width', label: 'Width', category: 'css', icon: 'width_full', description: 'Sets element width.', defaultData: { property: 'width', value: '100px' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_height', label: 'Height', category: 'css', icon: 'height', description: 'Sets element height.', defaultData: { property: 'height', value: '100px' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_padding', label: 'Padding', category: 'css', icon: 'padding', description: 'Sets padding.', defaultData: { property: 'padding', value: '10px' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_margin', label: 'Margin', category: 'css', icon: 'select_all', description: 'Sets margin.', defaultData: { property: 'margin', value: '10px' }, handles: [CSS_HANDLE_OUT] },
    
    // Flexbox
    { type: 'css_flex_direction', label: 'Flex Direction', category: 'css', icon: 'unfold_more', description: 'Sets flex direction.', defaultData: { property: 'flex-direction', value: 'row' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_justify_content', label: 'Justify Content', category: 'css', icon: 'align_horizontal_center', description: 'Aligns flex items.', defaultData: { property: 'justify-content', value: 'flex-start' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_align_items', label: 'Align Items', category: 'css', icon: 'align_vertical_center', description: 'Aligns flex items.', defaultData: { property: 'align-items', value: 'stretch' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_gap', label: 'Gap', category: 'css', icon: 'space_bar', description: 'Sets gap between items.', defaultData: { property: 'gap', value: '10px' }, handles: [CSS_HANDLE_OUT] },

    // Typography
    { type: 'css_color', label: 'Font Color', category: 'css', icon: 'format_color_text', description: 'Sets text color.', defaultData: { property: 'color', value: '#000000' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_font_family', label: 'Font Family', category: 'css', icon: 'font_download', description: 'Sets font.', defaultData: { property: 'font-family', value: 'sans-serif' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_font_size', label: 'Font Size', category: 'css', icon: 'format_size', description: 'Sets font size.', defaultData: { property: 'font-size', value: '16px' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_font_weight', label: 'Font Weight', category: 'css', icon: 'format_bold', description: 'Sets font weight.', defaultData: { property: 'font-weight', value: '400' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_text_align', label: 'Text Align', category: 'css', icon: 'format_align_left', description: 'Sets text alignment.', defaultData: { property: 'text-align', value: 'left' }, handles: [CSS_HANDLE_OUT] },

    // Background & Border
    { type: 'css_background_color', label: 'Background Color', category: 'css', icon: 'format_color_fill', description: 'Sets background color.', defaultData: { property: 'background-color', value: '#ffffff' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_background_image', label: 'Background Image', category: 'css', icon: 'image', description: 'Sets background image.', defaultData: { property: 'background-image', value: 'url()' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_border', label: 'Border', category: 'css', icon: 'border_all', description: 'Sets border.', defaultData: { property: 'border', value: '1px solid #000' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_border_radius', label: 'Border Radius', category: 'css', icon: 'rounded_corner', description: 'Sets corner radius.', defaultData: { property: 'border-radius', value: '5px' }, handles: [CSS_HANDLE_OUT] },

    // Effects
    { type: 'css_box_shadow', label: 'Box Shadow', category: 'css', icon: 'shadow', description: 'Adds a shadow.', defaultData: { property: 'box-shadow', value: '2px 2px 5px rgba(0,0,0,0.2)' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_opacity', label: 'Opacity', category: 'css', icon: 'opacity', description: 'Sets transparency.', defaultData: { property: 'opacity', value: '1' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_transform', label: 'Transform', category: 'css', icon: '3d_rotation', description: 'Applies 2D/3D transform.', defaultData: { property: 'transform', value: 'rotate(0deg)' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_transition', label: 'Transition', category: 'css', icon: 'movie_filter', description: 'Sets transition effects.', defaultData: { property: 'transition', value: 'all 0.3s ease' }, handles: [CSS_HANDLE_OUT] },
    { type: 'css_cursor', label: 'Cursor', category: 'css', icon: 'ads_click', description: 'Sets the mouse cursor.', defaultData: { property: 'cursor', value: 'pointer' }, handles: [CSS_HANDLE_OUT] },
];

const JAVASCRIPT_NODES: NodeDefinition[] = [
    // Events
    { type: 'js_event_on_click', label: 'On Click', category: 'javascript', icon: 'ads_click', description: 'Triggers on mouse click.', defaultData: {}, handles: [JS_EVENT_HANDLES.elementIn, JS_EVENT_HANDLES.actionOut] },
    { type: 'js_event_on_mouseover', label: 'On Mouse Over', category: 'javascript', icon: 'mouse', description: 'Triggers on mouse enter.', defaultData: {}, handles: [JS_EVENT_HANDLES.elementIn, JS_EVENT_HANDLES.actionOut] },
    { type: 'js_event_on_mouseout', label: 'On Mouse Out', category: 'javascript', icon: 'mouse', description: 'Triggers on mouse leave.', defaultData: {}, handles: [JS_EVENT_HANDLES.elementIn, JS_EVENT_HANDLES.actionOut] },
    { type: 'js_event_on_change', label: 'On Change', category: 'javascript', icon: 'published_with_changes', description: 'Triggers on input change.', defaultData: {}, handles: [JS_EVENT_HANDLES.elementIn, JS_EVENT_HANDLES.actionOut] },
    { type: 'js_event_on_submit', label: 'On Submit', category: 'javascript', icon: 'send', description: 'Triggers on form submit.', defaultData: {}, handles: [JS_EVENT_HANDLES.elementIn, JS_EVENT_HANDLES.actionOut] },
    { type: 'js_event_on_load', label: 'On Load', category: 'javascript', icon: 'download_done', description: 'Triggers when page loads.', defaultData: {}, handles: [JS_EVENT_HANDLES.actionOut] }, // No elementIn needed
    { type: 'js_event_on_keydown', label: 'On Key Down', category: 'javascript', icon: 'keyboard', description: 'Triggers when a key is pressed.', defaultData: {}, handles: [JS_EVENT_HANDLES.elementIn, JS_EVENT_HANDLES.actionOut] },

    // Actions
    { type: 'js_action_alert', label: 'Show Alert', category: 'javascript', icon: 'notification_important', description: 'Shows a browser alert.', defaultData: { message: 'Hello, Vortex!' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_console_log', label: 'Console Log', category: 'javascript', icon: 'terminal', description: 'Logs to the console.', defaultData: { message: 'Logged from visual builder.' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_toggle_class', label: 'Toggle CSS Class', category: 'javascript', icon: 'toggle_on', description: 'Toggles a CSS class.', defaultData: { selector: '', className: 'active' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_add_class', label: 'Add CSS Class', category: 'javascript', icon: 'add_circle', description: 'Adds a CSS class.', defaultData: { selector: '', className: 'active' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_remove_class', label: 'Remove CSS Class', category: 'javascript', icon: 'remove_circle', description: 'Removes a CSS class.', defaultData: { selector: '', className: 'active' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_set_text', label: 'Set Element Text', category: 'javascript', icon: 'edit_note', description: 'Changes element text.', defaultData: { selector: '', text: 'New text' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_set_attribute', label: 'Set Attribute', category: 'javascript', icon: 'settings', description: 'Sets an element attribute.', defaultData: { selector: '', attribute: 'href', value: '#' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_set_css_property', label: 'Set CSS Property', category: 'javascript', icon: 'style', description: 'Changes a CSS property.', defaultData: { selector: '', property: 'backgroundColor', value: 'red' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_fetch_api', label: 'Fetch API', category: 'javascript', icon: 'api', description: 'Makes a network request.', defaultData: { url: 'https://api.example.com/data' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_redirect', label: 'Redirect', category: 'javascript', icon: 'open_in_new', description: 'Redirects to a new URL.', defaultData: { url: 'https://www.google.com' }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
    { type: 'js_action_set_timeout', label: 'Set Timeout', category: 'javascript', icon: 'hourglass_empty', description: 'Delays next action.', defaultData: { delay: 1000 }, handles: [JS_ACTION_HANDLE_IN, JS_ACTION_HANDLE_OUT] },
];

export const NODE_LIBRARY: NodeDefinition[] = [
    ...HTML_NODES,
    ...CSS_NODES,
    ...JAVASCRIPT_NODES,
];

export const getNodeDefinitionByType = (type: string): NodeDefinition | undefined => {
    return NODE_LIBRARY.find(n => n.type === type);
}
