

import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedAppPayload, CreationMode, Project, GeneratedFile, VideoGenRequest, AnthropicModel, GeneratedPlanPayload, GenerationResult } from '../types'; // Removed ImageGenRequest
import { PROMPT_TEMPLATE_INITIAL, PROMPT_TEMPLATE_MODIFY, PROMPT_TEMPLATE_MIX_PROJECTS, parseToGeneratedAppPayload, PROMPT_TEMPLATE_ENHANCE_USER_PROMPT, PROMPT_TEMPLATE_GENERATE_PLAN, parseToGeneratedPlanPayload } from './promptService'; 

const getAnthropicClient = (apiKey: string) => new Anthropic({ apiKey });

const MAX_OUTPUT_TOKENS = 4096; // Claude 3 models have large context windows, but output tokens should be managed.

// Define the expected media types for Anthropic images
type AnthropicImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export const generateAppPlan = async (
  description: string,
  creationMode: CreationMode,
  apiKey: string,
  model: AnthropicModel
): Promise<GeneratedPlanPayload> => {
    const anthropic = getAnthropicClient(apiKey);
    const systemPrompt = `You are an expert software architect. Your output MUST be a JSON object with a single key "plan", containing a detailed project blueprint in Markdown. The JSON object should be the only content in your response.`;
    const userPrompt = PROMPT_TEMPLATE_GENERATE_PLAN(description, creationMode);
    try {
        const response = await anthropic.messages.create({
            model: model,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            max_tokens: MAX_OUTPUT_TOKENS,
            temperature: 0.5,
        });
        if (response.content && response.content[0] && response.content[0].type === 'text') {
            return parseToGeneratedPlanPayload(response.content[0].text, 'anthropic');
        } else {
            throw new Error("Anthropic API returned an unexpected response format for plan generation.");
        }
    } catch(err) {
        console.error("Error calling Anthropic API (generateAppPlan) or parsing response:", err);
        if (err instanceof Anthropic.APIError) {
            throw new Error(`Anthropic API Error (${err.status}): ${err.message}. Type: ${err.error?.type}.`);
        }
        throw new Error(`Failed to generate project plan with Anthropic for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
    }
};

export const generateAppCode = async (
  description: string,
  creationMode: CreationMode,
  apiKey: string,
  model: AnthropicModel,
  plan?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string; base64Data: string }
): Promise<GenerationResult> => {
  const anthropic = getAnthropicClient(apiKey);
  const systemPrompt = `You are an AI system acting as a visionary Senior Frontend Architect & a world-class UI/UX Lead Designer. Your output MUST be a JSON object adhering to the GeneratedAppPayload interface (note: imageGenerationRequests is no longer supported). The JSON object should be the only content in your response. Ensure all file content strings within the JSON are properly escaped (e.g., newlines as \\\\n, quotes as \\"). Adhere strictly to this JSON format:
\`\`\`json
{
  "appName": "string (optional)",
  "appDescription": "string (optional)",
  "files": [ { "path": "string", "content": "string" }, ... ],
  "entryPoint": "string (optional, e.g., public/index.html)",
  // "imageGenerationRequests": [ { "prompt": "string", "targetFilePath": "string" }, ... ] (REMOVED - DO NOT USE),
  "videoGenerationRequests": [ { "prompt": "string", "targetFilePath": "string" }, ... ] (optional)
}
\`\`\`
Focus on generating the file contents correctly. For images, directly embed <img> tags with placeholder URLs in HTML. Video generation requests are for assets you want created and placed at targetFilePath.`;

  const userPromptContent = PROMPT_TEMPLATE_INITIAL(description, creationMode, plan, scrapedOrBrowserUrl, figmaInspiration, mediaInput ? { mimeType: mediaInput.mimeType } : undefined);
  
  const messages: Anthropic.Messages.MessageParam[] = [];

  if (mediaInput && mediaInput.mimeType.startsWith('image/')) {
    messages.push({
        role: "user",
        content: [
            { type: "image", source: { type: "base64", media_type: mediaInput.mimeType as AnthropicImageMediaType, data: mediaInput.base64Data }},
            { type: "text", text: userPromptContent }
        ]
    });
  } else {
    messages.push({ role: "user", content: userPromptContent });
  }

  try {
    const response = await anthropic.messages.create({
      model: model,
      system: systemPrompt,
      messages: messages,
      max_tokens: MAX_OUTPUT_TOKENS, 
      temperature: 0.7, 
    });

    if (response.content && response.content[0] && response.content[0].type === 'text') {
      const responseText = response.content[0].text;
      const parsed = parseToGeneratedAppPayload(responseText, 'anthropic');
      if (!parsed.appName) parsed.appName = `Anthropic AI ${creationMode}`;
      if (!parsed.appDescription) parsed.appDescription = `An exceptionally crafted ${creationMode} by Anthropic based on: "${description.substring(0, 70)}..."`;
      return { payload: parsed, sources: undefined };
    } else {
      throw new Error("Anthropic API returned an unexpected response format or empty content.");
    }
  } catch (err) {
    console.error("Error calling Anthropic API (generateAppCode) or parsing response:", err);
     if (err instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API Error (${err.status}): ${err.message}. Type: ${err.error?.type}.`);
    }
    throw new Error(`Failed to generate code with Anthropic for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const modifyAppCode = async (
  currentFiles: GeneratedFile[], currentEntryPoint: string,
  userInstruction: string,
  creationMode: CreationMode,
  apiKey: string,
  model: AnthropicModel,
  currentAppName?: string, currentAppDescription?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string; base64Data: string }
): Promise<GenerationResult> => {
  const anthropic = getAnthropicClient(apiKey);
    const systemPrompt = `You are an AI system acting as a visionary Senior Frontend Architect & a world-class UI/UX Lead Designer. You will modify an existing project. Your output MUST be a JSON object adhering to the GeneratedAppPayload interface (note: imageGenerationRequests is no longer supported). The JSON object should be the only content in your response. Ensure all file content strings within the JSON are properly escaped. Adhere strictly to this JSON format:
\`\`\`json
{
  "appName": "string (optional)",
  "appDescription": "string (optional)",
  "files": [ { "path": "string", "content": "string" }, ... ],
  "entryPoint": "string (optional, e.g., public/index.html)",
  // "imageGenerationRequests": [ { "prompt": "string", "targetFilePath": "string" }, ... ] (REMOVED - DO NOT USE),
  "videoGenerationRequests": [ { "prompt": "string", "targetFilePath": "string" }, ... ] (optional)
}
\`\`\`
Return the complete code for ALL files, incorporating transformative changes. Unchanged files are included. Deleted files are omitted. New files are added. For images, directly embed <img> tags with placeholder URLs in HTML.`;

  const userPromptContent = PROMPT_TEMPLATE_MODIFY(currentFiles, currentEntryPoint, userInstruction, creationMode, currentAppName, currentAppDescription, scrapedOrBrowserUrl, figmaInspiration, mediaInput ? { mimeType: mediaInput.mimeType } : undefined);
  
  const messages: Anthropic.Messages.MessageParam[] = [];
  if (mediaInput && mediaInput.mimeType.startsWith('image/')) {
     messages.push({
        role: "user",
        content: [
            { type: "image", source: { type: "base64", media_type: mediaInput.mimeType as AnthropicImageMediaType, data: mediaInput.base64Data }},
            { type: "text", text: userPromptContent }
        ]
    });
  } else {
    messages.push({ role: "user", content: userPromptContent });
  }

  try {
    const response = await anthropic.messages.create({
      model: model,
      system: systemPrompt,
      messages: messages,
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.65,
    });
     if (response.content && response.content[0] && response.content[0].type === 'text') {
      const responseText = response.content[0].text;
      const parsed = parseToGeneratedAppPayload(responseText, 'anthropic');
      if (parsed.appName === undefined) parsed.appName = currentAppName;
      if (parsed.appDescription === undefined) parsed.appDescription = currentAppDescription;
      if (parsed.entryPoint === undefined) parsed.entryPoint = currentEntryPoint;
      return { payload: parsed, sources: undefined };
    } else {
      throw new Error("Anthropic API returned an unexpected response format or empty content for modification.");
    }
  } catch (err) {
    console.error("Error calling Anthropic API (modifyAppCode) or parsing response:", err);
    if (err instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API Error (${err.status}): ${err.message}. Type: ${err.error?.type}.`);
    }
    throw new Error(`Failed to modify code with Anthropic for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const mixProjectsCode = async (
  projects: Project[],
  apiKey: string,
  model: AnthropicModel
): Promise<GenerationResult> => {
  const anthropic = getAnthropicClient(apiKey);
  const systemPrompt = `You are an AI system for mixing multiple projects. Your output MUST be a JSON object adhering to the GeneratedAppPayload interface (note: imageGenerationRequests is no longer supported). The JSON object should be the only content in your response. Ensure all file content strings within the JSON are properly escaped. Adhere strictly to this JSON format:
\`\`\`json
{
  "appName": "string",
  "appDescription": "string",
  "files": [ { "path": "string", "content": "string" }, ... ],
  "entryPoint": "string (e.g., public/index.html)",
  // "imageGenerationRequests": [ { "prompt": "string", "targetFilePath": "string" }, ... ] (REMOVED - DO NOT USE),
  "videoGenerationRequests": [ { "prompt": "string", "targetFilePath": "string" }, ... ] (optional)
}
\`\`\`
Intelligently mix and merge the provided projects into a single, new, cohesive application. For images, directly embed <img> tags with placeholder URLs in HTML.`;
  const userPrompt = PROMPT_TEMPLATE_MIX_PROJECTS(projects);
  
  try {
    const response = await anthropic.messages.create({
      model: model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.75,
    });
    if (response.content && response.content[0] && response.content[0].type === 'text') {
      const responseText = response.content[0].text;
      const parsed = parseToGeneratedAppPayload(responseText, 'anthropic');
       if (!parsed.appName) {
        const projectNamesSummary = projects.map(p => p.appName.substring(0,10)).join(' & ');
        parsed.appName = `Anthropic Mix: ${projectNamesSummary}`;
      }
      if (!parsed.appDescription) {
          parsed.appDescription = `A stunning and innovative fusion by Anthropic of ${projects.map(p => `"${p.appName}"`).join(' and ')}.`;
      }
      return { payload: parsed, sources: undefined };
    } else {
      throw new Error("Anthropic API returned an unexpected response format or empty content for project mixing.");
    }
  } catch (err) {
    console.error("Error calling Anthropic API (mixProjectsCode) or parsing response:", err);
     if (err instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API Error (${err.status}): ${err.message}. Type: ${err.error?.type}.`);
    }
    throw new Error(`Failed to mix projects with Anthropic: ${err instanceof Error ? err.message : String(err)}`);
  }
};

// Removed generateImageFromPrompt function

export const enhancePromptText = async (
  originalPrompt: string,
  creationMode: CreationMode,
  apiKey: string,
  model: AnthropicModel,
): Promise<string> => {
  const anthropic = getAnthropicClient(apiKey);
  // System prompt for prompt enhancement can be simpler as it's not generating complex JSON
  const systemPrompt = "You are a highly skilled prompt engineering assistant. Your task is to expand and detail the user's idea for a software project. Return ONLY the enhanced prompt text, nothing else. Make it significantly longer, more descriptive, and actionable for an AI code generator.";
  const userEnhancementRequest = PROMPT_TEMPLATE_ENHANCE_USER_PROMPT(originalPrompt, creationMode);

  try {
    const response = await anthropic.messages.create({
      model: model,
      system: systemPrompt,
      messages: [{ role: "user", content: userEnhancementRequest }],
      max_tokens: MAX_OUTPUT_TOKENS, // Can be adjusted; prompt enhancement might not need full 4k.
      temperature: 0.7,
    });

    if (response.content && response.content[0] && response.content[0].type === 'text') {
      const enhancedPrompt = response.content[0].text.trim();
      if (!enhancedPrompt) {
          throw new Error("Anthropic API returned an empty enhanced prompt.");
      }
      return enhancedPrompt;
    } else {
      throw new Error("Anthropic API returned an unexpected response format or empty content for prompt enhancement.");
    }
  } catch (err) {
    console.error("Error calling Anthropic API (enhancePromptText):", err);
    if (err instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API Error (${err.status}) for prompt enhancement: ${err.message}. Type: ${err.error?.type}.`);
    }
    throw new Error(`Failed to enhance prompt with Anthropic: ${err instanceof Error ? err.message : String(err)}`);
  }
};
