

import OpenAI from "openai";
import type { GeneratedAppPayload, CreationMode, Project, GeneratedFile, VideoGenRequest, OpenAIModel, GeneratedPlanPayload, GenerationResult } from '../types'; // Removed ImageGenRequest
import { PROMPT_TEMPLATE_INITIAL, PROMPT_TEMPLATE_MODIFY, PROMPT_TEMPLATE_MIX_PROJECTS, parseToGeneratedAppPayload, PROMPT_TEMPLATE_ENHANCE_USER_PROMPT, PROMPT_TEMPLATE_GENERATE_PLAN, parseToGeneratedPlanPayload } from './promptService'; 

// Helper function to create a new OpenAI client instance
const getOpenAIClient = (apiKey: string) => new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

export const generateAppPlan = async (
  description: string,
  creationMode: CreationMode,
  apiKey: string,
  model: OpenAIModel
): Promise<GeneratedPlanPayload> => {
  const openai = getOpenAIClient(apiKey);
  const systemPrompt = `You are an expert software architect. Your output MUST be a JSON object with a single key "plan", containing a detailed project blueprint in Markdown.`;
  const userPrompt = PROMPT_TEMPLATE_GENERATE_PLAN(description, creationMode);
  
  try {
     const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });
    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI API returned an empty response for plan generation.");
    }
    return parseToGeneratedPlanPayload(responseContent, 'openai');
  } catch(err) {
    console.error("Error calling OpenAI API (generateAppPlan) or parsing response:", err);
    if (err instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error (${err.status}): ${err.message}. Type: ${err.type}. Code: ${err.code}.`);
    }
    throw new Error(`Failed to generate project plan with OpenAI for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const generateAppCode = async (
  description: string,
  creationMode: CreationMode,
  apiKey: string,
  model: OpenAIModel,
  plan?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string; base64Data: string }
): Promise<GenerationResult> => {
  const openai = getOpenAIClient(apiKey);
  const systemPrompt = "You are an AI system acting as a visionary Senior Frontend Architect & a world-class UI/UX Lead Designer. Your output MUST be a JSON object adhering to the GeneratedAppPayload interface (note: imageGenerationRequests is no longer supported). Ensure all file content strings are properly escaped for JSON (e.g., newlines as \\\\n). For images, directly embed <img> tags with placeholder URLs in HTML.";
  
  const userPrompt = PROMPT_TEMPLATE_INITIAL(description, creationMode, plan, scrapedOrBrowserUrl, figmaInspiration, mediaInput ? { mimeType: mediaInput.mimeType } : undefined);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt }
  ];

  if (mediaInput && mediaInput.mimeType.startsWith('image/')) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: `data:${mediaInput.mimeType};base64,${mediaInput.base64Data}` } }
      ]
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7, 
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI API returned an empty response.");
    }
    
    const parsed = parseToGeneratedAppPayload(responseContent, 'openai');
    if (!parsed.appName) parsed.appName = `OpenAI AI ${creationMode}`;
    if (!parsed.appDescription) parsed.appDescription = `An exceptionally crafted ${creationMode} by OpenAI based on: "${description.substring(0, 70)}..."`;
    return { payload: parsed, sources: undefined };

  } catch (err) {
    console.error("Error calling OpenAI API (generateAppCode) or parsing response:", err);
    if (err instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error (${err.status}): ${err.message}. Type: ${err.type}. Code: ${err.code}.`);
    }
    throw new Error(`Failed to generate code with OpenAI for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const modifyAppCode = async (
  currentFiles: GeneratedFile[], currentEntryPoint: string,
  userInstruction: string,
  creationMode: CreationMode,
  apiKey: string,
  model: OpenAIModel,
  currentAppName?: string, currentAppDescription?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string; base64Data: string }
): Promise<GenerationResult> => {
  const openai = getOpenAIClient(apiKey);
  const systemPrompt = "You are an AI system acting as a visionary Senior Frontend Architect & a world-class UI/UX Lead Designer. You will modify an existing project. Your output MUST be a JSON object adhering to the GeneratedAppPayload interface (note: imageGenerationRequests is no longer supported). Ensure all file content strings are properly escaped for JSON. For images, directly embed <img> tags with placeholder URLs in HTML.";
  
  const userPrompt = PROMPT_TEMPLATE_MODIFY(currentFiles, currentEntryPoint, userInstruction, creationMode, currentAppName, currentAppDescription, scrapedOrBrowserUrl, figmaInspiration, mediaInput ? { mimeType: mediaInput.mimeType } : undefined);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt }
  ];

  if (mediaInput && mediaInput.mimeType.startsWith('image/')) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: `data:${mediaInput.mimeType};base64,${mediaInput.base64Data}` } }
      ]
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.65,
      response_format: { type: "json_object" },
    });
    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI API returned an empty response for modification.");
    }
    const parsed = parseToGeneratedAppPayload(responseContent, 'openai');
    if (parsed.appName === undefined) parsed.appName = currentAppName;
    if (parsed.appDescription === undefined) parsed.appDescription = currentAppDescription;
    if (parsed.entryPoint === undefined) parsed.entryPoint = currentEntryPoint; 
    return { payload: parsed, sources: undefined };
  } catch (err) {
    console.error("Error calling OpenAI API (modifyAppCode) or parsing response:", err);
     if (err instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error (${err.status}): ${err.message}. Type: ${err.type}. Code: ${err.code}.`);
    }
    throw new Error(`Failed to modify code with OpenAI for ${creationMode}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

export const mixProjectsCode = async (
  projects: Project[],
  apiKey: string,
  model: OpenAIModel
): Promise<GenerationResult> => {
  const openai = getOpenAIClient(apiKey);
  const systemPrompt = "You are an AI system for mixing multiple projects. Your output MUST be a JSON object adhering to the GeneratedAppPayload interface (note: imageGenerationRequests is no longer supported). Ensure all file content strings are properly escaped for JSON. For images, directly embed <img> tags with placeholder URLs in HTML.";
  const userPrompt = PROMPT_TEMPLATE_MIX_PROJECTS(projects);
  
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.75,
      response_format: { type: "json_object" },
    });
    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI API returned an empty response for project mixing.");
    }
    const parsed = parseToGeneratedAppPayload(responseContent, 'openai');
    if (!parsed.appName) {
        const projectNamesSummary = projects.map(p => p.appName.substring(0,10)).join(' & ');
        parsed.appName = `OpenAI Mix: ${projectNamesSummary}`;
    }
    if (!parsed.appDescription) {
        parsed.appDescription = `A stunning and innovative fusion by OpenAI of ${projects.map(p => `"${p.appName}"`).join(' and ')}.`;
    }
    return { payload: parsed, sources: undefined };
  } catch (err) {
    console.error("Error calling OpenAI API (mixProjectsCode) or parsing response:", err);
    if (err instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error (${err.status}): ${err.message}. Type: ${err.type}. Code: ${err.code}.`);
    }
    throw new Error(`Failed to mix projects with OpenAI: ${err instanceof Error ? err.message : String(err)}`);
  }
};

// Removed generateImageFromPrompt function

export const enhancePromptText = async (
  originalPrompt: string,
  creationMode: CreationMode,
  apiKey: string,
  model: OpenAIModel,
): Promise<string> => {
  const openai = getOpenAIClient(apiKey);
  const systemPrompt = "You are a highly skilled prompt engineering assistant. Your task is to expand and detail the user's idea for a software project. Return ONLY the enhanced prompt text, nothing else.";
  const userEnhancementRequest = PROMPT_TEMPLATE_ENHANCE_USER_PROMPT(originalPrompt, creationMode);

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userEnhancementRequest }
      ],
      temperature: 0.7,
      // No response_format for plain text, though OpenAI usually returns JSON for chat.
      // We will extract text from the message content.
    });

    const enhancedPrompt = response.choices[0]?.message?.content?.trim();
    if (!enhancedPrompt) {
      throw new Error("OpenAI API returned an empty enhanced prompt.");
    }
    return enhancedPrompt;

  } catch (err) {
    console.error("Error calling OpenAI API (enhancePromptText):", err);
    if (err instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error (${err.status}) for prompt enhancement: ${err.message}. Type: ${err.type}. Code: ${err.code}.`);
    }
    throw new Error(`Failed to enhance prompt with OpenAI: ${err instanceof Error ? err.message : String(err)}`);
  }
};
