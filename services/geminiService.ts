import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from "@google/genai";
import type { GeneratedAppPayload, CreationMode, Project, GeneratedFile, GeminiModel, GeneratedPlanPayload, GenerationResult, GroundingSource } from '../types';
import { PROMPT_TEMPLATE_INITIAL, PROMPT_TEMPLATE_MODIFY, PROMPT_TEMPLATE_MIX_PROJECTS, parseToGeneratedAppPayload, PROMPT_TEMPLATE_ENHANCE_USER_PROMPT, PROMPT_TEMPLATE_GENERATE_PLAN, parseToGeneratedPlanPayload } from './promptService';


const API_KEY = process.env.API_KEY;
// const imageModelName = 'imagen-3.0-generate-002'; // Image model no longer used by this service

let aiClient: GoogleGenAI | null = null;

if (!API_KEY) {
  console.error("Gemini API Key is not found. Please set the API_KEY environment variable. Gemini services will be unavailable.");
} else {
  try {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI client:", e);
    aiClient = null; // Ensure client is null if initialization fails
  }
}

const checkClient = () => {
  if (!aiClient) {
    throw new Error("Gemini API client is not initialized. API_KEY may be missing or invalid.");
  }
  return aiClient;
}

export const generateAppPlan = async (
  description: string,
  creationMode: CreationMode,
  modelId: GeminiModel
): Promise<GeneratedPlanPayload> => {
  const ai = checkClient();
  const textPrompt = PROMPT_TEMPLATE_GENERATE_PLAN(description, creationMode);
  try {
     const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: textPrompt }] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
        topK: 40,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      }
    });
    return parseToGeneratedPlanPayload(response.text, 'gemini');
  } catch(err) {
    console.error("Error calling Gemini API (generateAppPlan) or parsing response:", err);
    if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
        throw new Error("Invalid API Key. Please check your API_KEY configuration.");
    }
    throw new Error(`Failed to generate project plan for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const generateAppCode = async (
  description: string,
  creationMode: CreationMode,
  modelId: GeminiModel,
  plan?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string; base64Data: string }
): Promise<GenerationResult> => {
  const ai = checkClient();
  const textPrompt = PROMPT_TEMPLATE_INITIAL(description, creationMode, plan, scrapedOrBrowserUrl, figmaInspiration, mediaInput ? { mimeType: mediaInput.mimeType } : undefined);

  const requestParts: Part[] = [{ text: textPrompt }];
  if (mediaInput && mediaInput.base64Data) { 
    requestParts.push({ inlineData: { mimeType: mediaInput.mimeType, data: mediaInput.base64Data } });
  }
  
  const config: any = {
    responseMimeType: "application/json",
    temperature: 0.75, 
    topP: 0.95,
    topK: 50,
    thinkingConfig: modelId === 'gemini-2.5-flash' ? { thinkingBudget: 0 } : undefined,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: requestParts },
      config: config
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] | undefined = groundingChunks
        ?.filter(chunk => chunk.web && chunk.web.uri)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri
        }));

    const parsed = parseToGeneratedAppPayload(response.text, 'gemini');
    if (!parsed.appName) parsed.appName = `Amazing AI ${creationMode}`;
    if (!parsed.appDescription) parsed.appDescription = `An exceptionally crafted ${creationMode} based on: "${description.substring(0,70)}..."`;
    
    return { payload: parsed, sources };

  } catch (err) {
    console.error("Error calling Gemini API (generateAppCode) or parsing response:", err);
    if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
        throw new Error("Invalid API Key. Please check your API_KEY configuration.");
    } else if (err instanceof Error && err.message.includes("Internal error encountered")) {
        throw new Error(`Gemini API Internal Error: ${err.message}. This may be a temporary issue with the API service or the request complexity.`);
    }
     else {
        throw new Error(`Failed to generate code for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

export const modifyAppCode = async (
  currentFiles: GeneratedFile[], currentEntryPoint: string,
  userInstruction: string,
  creationMode: CreationMode,
  modelId: GeminiModel,
  currentAppName?: string, currentAppDescription?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string; base64Data: string }
): Promise<GenerationResult> => {
  const ai = checkClient();
  const textPrompt = PROMPT_TEMPLATE_MODIFY(currentFiles, currentEntryPoint, userInstruction, creationMode, currentAppName, currentAppDescription, scrapedOrBrowserUrl, figmaInspiration, mediaInput ? { mimeType: mediaInput.mimeType } : undefined);

  const requestParts: Part[] = [{ text: textPrompt }];
  if (mediaInput && mediaInput.base64Data) {
    requestParts.push({ inlineData: { mimeType: mediaInput.mimeType, data: mediaInput.base64Data } });
  }
  
  const config: any = {
    responseMimeType: "application/json",
    temperature: 0.65, 
    topP: 0.95,
    topK: 45,
    thinkingConfig: modelId === 'gemini-2.5-flash' ? { thinkingBudget: 0 } : undefined,
    safetySettings: [ 
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: requestParts },
      config: config
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] | undefined = groundingChunks
        ?.filter(chunk => chunk.web && chunk.web.uri)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri
        }));

    const parsed = parseToGeneratedAppPayload(response.text, 'gemini');
    if (parsed.appName === undefined) parsed.appName = currentAppName;
    if (parsed.appDescription === undefined) parsed.appDescription = currentAppDescription;
    if (parsed.entryPoint === undefined) parsed.entryPoint = currentEntryPoint; 
    
    return { payload: parsed, sources };

  } catch (err) { 
    console.error("Error calling Gemini API (modifyAppCode) or parsing response:", err);
     if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
        throw new Error("Invalid API Key. Please check your API_KEY configuration.");
    } else if (err instanceof Error && err.message.includes("Internal error encountered")) {
        throw new Error(`Gemini API Internal Error: ${err.message}. This may be a temporary issue with the API service or the request complexity.`);
    } else if (err instanceof Error && err.message.toLowerCase().includes("token count")) {
        throw new Error(`Input too large for AI model (token limit exceeded): ${err.message}. Try a shorter modification or ensure images are not directly in HTML.`);
    }
     else {
        throw new Error(`Failed to modify code for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

export const mixProjectsCode = async (
  projects: Project[],
  modelId: GeminiModel
): Promise<GenerationResult> => {
  const ai = checkClient();
  if (!projects || projects.length < 2) {
    throw new Error("At least two projects are required for mixing.");
  }

  const textPrompt = PROMPT_TEMPLATE_MIX_PROJECTS(projects);
  
  const config: any = {
    responseMimeType: "application/json",
    temperature: 0.75, 
    topP: 0.95,
    topK: 50,
    thinkingConfig: modelId === 'gemini-2.5-flash' ? { thinkingBudget: 0 } : undefined,
    safetySettings: [ 
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: textPrompt }] },
      config: config
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] | undefined = groundingChunks
        ?.filter(chunk => chunk.web && chunk.web.uri)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri
        }));

    const parsed = parseToGeneratedAppPayload(response.text, 'gemini');
    
    if (!parsed.appName) {
        const projectNamesSummary = projects.map(p => p.appName.substring(0,10)).join(' & ');
        parsed.appName = `Spectacular Mix: ${projectNamesSummary}`;
    }
    if (!parsed.appDescription) {
        parsed.appDescription = `A stunning and innovative fusion of ${projects.map(p => `"${p.appName}"`).join(' and ')}.`;
    }
    
    return { payload: parsed, sources };

  } catch (err) { 
    console.error("Error calling Gemini API (mixProjectsCode) or parsing response:", err);
    if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
        throw new Error("Invalid API Key. Please check your API_KEY configuration.");
    } else if (err instanceof Error && err.message.includes("Internal error encountered")) {
        throw new Error(`Gemini API Internal Error: ${err.message}. This may be a temporary issue with the API service or the request complexity.`);
    }
    else {
        throw new Error(`Failed to mix projects: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

// Removed generateImageFromPrompt function

export const generateVideoFromPrompt = async (prompt: string): Promise<string> => { // Returns a URL to a placeholder video
  // No direct API_KEY check here as it's simulated, but checkClient() could be used if it were real
  if (!API_KEY) console.warn("API_KEY is not configured for Gemini, video generation is simulated so this is okay for now.");
  
  console.log(`Simulating video generation for prompt: "${prompt.substring(0,50)}..."`);
  
  const placeholderVideos = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ];
  
  const selectedPlaceholder = placeholderVideos[Math.floor(Math.random() * placeholderVideos.length)];
  
  return Promise.resolve(selectedPlaceholder);
};

export const enhancePromptText = async (
  originalPrompt: string,
  creationMode: CreationMode,
  modelId: GeminiModel,
): Promise<string> => {
  const ai = checkClient();
  const textPromptContent = PROMPT_TEMPLATE_ENHANCE_USER_PROMPT(originalPrompt, creationMode);
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: textPromptContent }] },
      config: {
        // IMPORTANT: Do NOT request JSON for this. Expecting plain text.
        // responseMimeType: "application/json", 
        temperature: 0.7, 
        topP: 0.95,
        topK: 50,
        thinkingConfig: modelId === 'gemini-2.5-flash' ? { thinkingBudget: 0 } : undefined,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      }
    });
    
    // The response text IS the enhanced prompt
    const enhancedPrompt = response.text.trim();
    if (!enhancedPrompt) {
        throw new Error("AI returned an empty enhanced prompt.");
    }
    return enhancedPrompt;

  } catch (err) {
    console.error("Error calling Gemini API (enhancePromptText):", err);
    if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
        throw new Error("Invalid API Key for prompt enhancement.");
    } else if (err instanceof Error && err.message.includes("Internal error encountered")) {
        throw new Error(`Gemini API Internal Error during prompt enhancement: ${err.message}.`);
    } else {
        throw new Error(`Failed to enhance prompt: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};
