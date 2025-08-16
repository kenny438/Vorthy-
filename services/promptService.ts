
import type { GeneratedAppPayload, CreationMode, Project, GeneratedFile, AIProvider, GeneratedPlanPayload } from '../types';
import { creationModeToLabel } from '../types'; // Import the new utility

// Moved from geminiService.ts - these are now generic templates
const getModeSpecificInstructions = (mode: CreationMode): string => {
  let coreInstruction = "";
  let animationEmphasis = "Subtle, purposeful animations should enhance UX. ";
  let visualEmphasis = "Ensure a modern, polished, and visually appealing UI. ";

  switch (mode) {
    case 'app':
      coreInstruction = `CRITICAL MODE: FULL APPLICATION. Generate a comprehensive, multi-file application structure. This includes a \`public\` directory with \`public/index.html\`, \`public/style.css\`, and \`public/script.js\`. A \`src\` directory for components/modules is highly encouraged for complexity. The application **MUST BE 'biggggggg', interactive, deeply engaging, and visually STUNNING.** Feature multiple distinct sections and rich content **VISIBLE IN THE INITIAL HTML (\`public/index.html\`) RENDER**. The \`<body>\` of \`public/index.html\` should contain a main application container (e.g., \`<div id="app-root"></div>\`) which **MUST ITSELF CONTAIN A BASIC BUT VISIBLE LAYOUT STRUCTURE** for the app's primary view, including placeholder elements for key UI areas, sidebars, content regions, etc. JavaScript should enhance this structure, not create it from a completely empty body. The goal is an immediately usable and visually impressive shell in \`public/index.html\`, which JavaScript then brings to full interactivity.`;
      animationEmphasis = "**MUST integrate captivating animations and micro-interactions throughout the app to create a dynamic and fluid user experience.** Use CSS for simple transitions and JS/GSAP for complex sequences. ";
      visualEmphasis = "**Design a flagship-quality UI that is aesthetically breathtaking, intuitive, and memorable.** ";
      break;
    case 'component':
      coreInstruction = "CRITICAL MODE: UI COMPONENT. Generate files for a single, reusable UI component (e.g., `my-component.html`, `.css`, `.js`). Provide a simple `public/index.html` to clearly demonstrate this component. The component itself should be visually polished and highly functional.";
      animationEmphasis = "If applicable, the component should feature smooth interactive animations. ";
      visualEmphasis = "The component's design must be clean, modern, and ready for integration into a larger, high-quality application. ";
      break;
    case 'animation':
      coreInstruction = `CRITICAL MODE: ANIMATION SHOWCASE.
-   **ABSOLUTELY ESSENTIAL: The primary HTML file (e.g., \`public/index.html\`) MUST include distinct, visible HTML elements as targets for the animation.** These elements NEED prominent styling.
-   The animation logic (CSS keyframes in \`public/style.css\` or JavaScript in \`public/script.js\`) **MUST be the STAR of the show, creating a CAPTIVATING and VISUALLY IMPRESSIVE effect.**
-   If GSAP is requested/implied, its CDN **MUST** be in \`public/index.html\` and used for sophisticated animation in \`public/script.js\`.
-   The output **MUST** be a working, engaging animation demo. Entry point: \`public/index.html\`.`;
      animationEmphasis = "**This IS an animation piece. Make it extraordinary and jaw-dropping!** ";
      visualEmphasis = "Visuals must complement and enhance the animation's impact. ";
      break;
    case 'landing_page':
      coreInstruction = `CRITICAL MODE: LANDING PAGE. Generate \`public/index.html\`, \`style.css\`, \`script.js\` for a **visually stunning and highly persuasive landing page.**
-   **MANDATORY STRUCTURE:** The \`public/index.html\` **MUST** feature a clear header, a distinct footer, AND **AT LEAST 3-5 CLEARLY VISIBLE AND SUBSTANTIAL HTML CONTENT SECTIONS** directly within the \`<body>\` of \`public/index.html\`, between the header and footer. These sections must be distinct (e.g., using \`<section>\` tags with unique IDs/classes) and immediately render content.
-   **CONTENT REQUIREMENT:** Each of these main content sections **MUST BE RICHLY POPULATED** with substantial placeholder text (e.g., multiple paragraphs of Lorem Ipsum or thematic descriptions, lists, headings) and appropriate \`<img>\` tags with high-quality image URLs.
-   The page needs multiple well-designed sections, compelling content, clear calls to action, and an overall premium feel. The generated \`public/index.html\` itself should be a complete, scrollable page showcasing these multiple content areas.`;
      animationEmphasis = "**Incorporate scroll-triggered animations, subtle hover effects, and engaging transitions to guide the user and add polish.** ";
      visualEmphasis = "**Design should be award-winning quality: modern, clean, and highly engaging, encouraging conversion.** ";
      break;
    case 'interactive_element':
      coreInstruction = "CRITICAL MODE: INTERACTIVE ELEMENT. Generate files for a specific interactive piece (e.g., a custom slider, a unique menu). Host in `public/index.html`, style with `public/style.css`, logic in `public/script.js`. The interactivity should be **smooth, intuitive, and delightful to use.**";
      animationEmphasis = "The element's interactivity should be enhanced by fluid animations and responsive feedback. ";
      visualEmphasis = "The element must be beautifully designed and a joy to interact with. ";
      break;
    case 'data_viz':
      coreInstruction = "CRITICAL MODE: DATA VISUALIZATION. Generate `public/index.html`, `style.css`, `script.js` for **clear, insightful, and visually appealing charts or data visualizations.** If using a library (e.g., Chart.js), include CDN links and use it effectively. The visualization must be easy to understand and engaging.";
      animationEmphasis = "Use animations to make data presentation more dynamic and understandable (e.g., animated chart loading/updates). ";
      visualEmphasis = "The visualization should be clean, professional, and aesthetically pleasing, making complex data accessible. ";
      break;
    default:
      coreInstruction = "CRITICAL MODE: FULL APPLICATION (Default). As 'app' mode, generate a multi-file structure. **The application MUST BE 'biggggggg', interactive, deeply engaging, and visually STUNNING.**";
      animationEmphasis = "**MUST integrate captivating animations and micro-interactions.** ";
      visualEmphasis = "**Design a flagship-quality UI.** ";
  }
  return `${coreInstruction} ${animationEmphasis} ${visualEmphasis} Always ensure correct relative asset linking. For all images, use placeholder URLs from services like Unsplash or Picsum. Do NOT request AI image generation.`;
};

const commonFileStructureInstructions = `
**File Structure & Output:**
- Your output **MUST** be a JSON object adhering to the \`GeneratedAppPayload\` interface (note: \`imageGenerationRequests\` is no longer part of this interface).
- The \`files\` array is **CRITICAL**. Each element **MUST** be an object \`{ path: string, content: string }\`.
  - \`path\`: Full path from project root (e.g., "public/index.html", "src/components/Button.js").
  - \`content\`: The actual string content of the file.
- **MANDATORY BASE FILES:** Always include at least:
    - \`public/index.html\` (this should be the main HTML document)
    - \`public/style.css\`
    - \`public/script.js\`
- In \`public/index.html\`, links to CSS and JS **MUST** use relative paths (e.g., \`<link rel="stylesheet" href="./style.css">\`, \`<script src="./script.js" defer></script>\`).
- The \`entryPoint\` field in the JSON response should be the path to the main HTML file, typically \`"public/index.html"\`.
`;

const ADVANCED_QUALITY_MANDATE = `
**UNIVERSAL QUALITY MANDATE: "SOOOOOOO GOOOOOD" & "FLAGSHIP PRODUCT" LEVEL**
-   **Animations & Interactivity (ABSOLUTE REQUIREMENT):**
    *   Integrate smooth, purposeful, and **visually delightful animations and micro-interactions** throughout.
    *   Utilize CSS transitions/animations for elegance. For complex scenarios or if GSAP is requested, use JavaScript robustly.
    *   The application must feel **alive, responsive, and exceptionally engaging.** Avoid static, lifeless outputs.
-   **Visual Excellence & "Wow" Factor (NON-NEGOTIABLE):**
    *   Design must be **visually stunning, aesthetically captivating, modern, and highly polished.** Think award-winning, flagship product quality.
    *   Employ advanced CSS, sophisticated color palettes, gradients, subtle shadows, and impeccable typography and spacing to create a premium, delightful user experience.
    *   Content (even placeholder) should be well-formatted and contribute to a professional look. For images, use high-quality placeholder URLs (e.g., from Unsplash, Picsum).
-   **User Experience (UX) - Top Priority:**
    *   Intuitive navigation, clear information hierarchy, and satisfying interactions are paramount.
    *   The generated app should be a **joy to use**, encouraging exploration and repeated engagement.
-   **"Biggggggg" & Feature-Rich (Especially for Apps/Landing Pages):**
    *   Avoid trivial or skeletal outputs. Deliver substantial content, multiple interactive sections, and a sense of completeness.
    *   Incorporate innovative or clever features where appropriate to elevate the experience.
-   **Code Quality & Structure:**
    *   All generated code (HTML, CSS, JS) **MUST BE 100% free of syntax errors and immediately executable.**
    *   Adhere to best practices for readability and maintainability.
    *   Ensure all DOM manipulations in JS are safe (e.g., \`DOMContentLoaded\`, deferred scripts).
-   **GSAP Integration (If Requested/Implied):**
    *   **MUST** include GSAP CDN in \`public/index.html\`.
    *   **MUST** use GSAP effectively in \`public/script.js\` to create **impressive, non-trivial animations** that significantly enhance the visual appeal. Simple fades or movements are not enough if GSAP is invoked; aim for signature animation quality.
`;

const STRIPE_MONETIZATION_INSTRUCTIONS = `
**STANDARD MONETIZATION FEATURE (Stripe Example):**
- As a value-add, you MUST include a sample monetization feature using a Stripe Checkout integration. This demonstrates to the user how they could monetize their app.
- **In \`public/index.html\`:**
  - Add the Stripe.js script tag in the <head>: \`<script src="https://js.stripe.com/v3/"></script>\`.
  - Add a prominent, well-styled "Support the Creator" button in the UI, e.g., \`<button id="checkout-button">Support the Creator ($1)</button>\`.
- **In \`public/script.js\`:**
  - Initialize Stripe with a **placeholder public key**: \`const stripe = Stripe('pk_test_YOUR_PUBLIC_KEY_HERE');\`.
  - Add an event listener to the '#checkout-button'.
  - Inside the listener, create a \`fetch\` request to a **placeholder backend endpoint**: \`fetch('/create-checkout-session', { method: 'POST' })\`.
  - Show how to handle the response (getting a session ID) and redirecting to Stripe Checkout: \`stripe.redirectToCheckout({ sessionId: session.id })\`.
- **Add comments in the JavaScript file** explaining that this is a sample integration and what the user needs to do to make it work:
  /* 
   * Example Stripe Integration:
   * To make this work, you need to:
   * 1. Sign up for a Stripe account and get your own API keys.
   * 2. Replace 'pk_test_YOUR_PUBLIC_KEY_HERE' with your actual Stripe publishable key.
   * 3. Create a backend server (e.g., using Node.js, Python, Ruby) to handle the 
   *    '/create-checkout-session' route. This server-side code will use your 
   *    Stripe SECRET key to securely create a checkout session.
   * 4. Update the fetch URL if your backend is hosted elsewhere.
   *
   * This is a template to get you started!
   */
- This entire feature MUST be seamlessly integrated into the application's design.
`;

const VIDEO_GENERATION_INSTRUCTIONS = `
**AI-Powered Video Generation (Optional Feature - Simulated):**
- If the user's idea or visual context strongly implies a need for a **short, dynamic video clip** (e.g., an intro, a product showcase, an animated background), you can request its generation via the \`videoGenerationRequests\` array.
- Each object in \`videoGenerationRequests\` **MUST** be:
  \`{ prompt: "A detailed prompt for the video (e.g., 'Cinematic reveal of a futuristic car')", targetFilePath: "public/assets/videos/intro_animation.mp4" }\`
- \`targetFilePath\` **MUST** be a new, unique path (e.g., \`public/assets/videos/hero_video.mp4\`).
- In your HTML (\`files\` array), you **MUST** include a \`<video>\` tag. This tag **MUST** use the exact \`targetFilePath\` as its \`src\` attribute and include the \`controls\` attribute.
  Example HTML: \`<video src="public/assets/videos/product_showcase.mp4" controls autoplay muted loop width="640" height="360"></video>\`
  Corresponding request: \`{ "prompt": "Smooth animation showcasing key features of a sleek smartphone, 360-degree view, dynamic lighting", "targetFilePath": "public/assets/videos/product_showcase.mp4" }\`
- Do NOT request more than 1 video per generation/modification step.
- **IMPORTANT:** The actual video generation is *simulated*. The file at \`targetFilePath\` will contain a URL to a placeholder video. Ensure your HTML is set up to display this.
`;

export const PROMPT_TEMPLATE_GENERATE_PLAN = (
  userInput: string,
  creationMode: CreationMode
): string => `
You are an expert software architect and project planner. Based on the user's idea for a "${creationModeToLabel(creationMode)}", create a detailed project blueprint in Markdown format.

The blueprint should be comprehensive and cover:
- **Concept:** A refined, one-paragraph summary of the project's purpose and appeal.
- **Core Features:** A bulleted list of the 3-5 most important features. Also, include a standard monetization feature using a Stripe Checkout example as one of the core features or in the tech stack.
- **Tech Stack:** Suggested technologies (e.g., HTML, CSS, JS, frameworks/libraries like GSAP if relevant).
- **File Structure:** A proposed list of files and a brief description of their purpose.
- **UI/UX Flow:** A high-level description of how a user will interact with the app.
- **Visual Design:** A description of the suggested color palette, typography, and overall aesthetic.

Your output **MUST** be a JSON object with a single key "plan", containing the full Markdown string. The markdown should be well-structured and readable.

**User Idea:** "${userInput}"

Example Output Format:
\`\`\`json
{
  "plan": "### Project Blueprint: My Awesome App\\n\\n**Concept:**\\nA sleek, modern application that does X, Y, and Z, designed for creative professionals...\\n\\n**Core Features:**\\n- Feature 1: Description...\\n- Feature 2: Description...\\n- Sample Monetization: Includes a sample Stripe Checkout button to demonstrate monetization.\\n\\n**Tech Stack:**\\n- HTML5, CSS3, JavaScript (ES6)\\n- Stripe.js\\n\\n**File Structure:**\\n- \`public/index.html\`: Main entry point.\\n- \`public/style.css\`: All styles.\\n- \`public/script.js\`: Application logic.\\n\\n**UI/UX Flow:**\\nUpon loading, users are greeted by...\\n\\n**Visual Design:**\\nA minimalist, dark-themed interface with..."
}
\`\`\`

Now, generate the plan for the user's idea.
`;


export const PROMPT_TEMPLATE_INITIAL = (
  userInput: string,
  creationMode: CreationMode,
  plan?: string, // Optional project plan
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string }
): string => `
You are an AI system acting as a **visionary Senior Frontend Architect & a world-class UI/UX Lead Designer.**
Your mission: Transform user ideas into **EXTRAORDINARY, "SOOOOOOO GOOOOOD", fully functional, multi-file web application projects that users will LOVE and want to use repeatedly.**
The absolute priority is the **breathtaking visual and interactive quality, advanced features, and substantial nature of the generated preview.**

**Output Requirements:** (Strict JSON format, see interface below. Note: \`imageGenerationRequests\` is NO LONGER supported)
\`\`\`typescript
interface GeneratedFile { path: string; content: string; }
interface VideoGenRequest { prompt: string; targetFilePath: string; }
interface GeneratedAppPayload { 
  appName?: string; 
  appDescription?: string; 
  files: GeneratedFile[]; 
  entryPoint?: string; 
  videoGenerationRequests?: VideoGenRequest[]; 
}
\`\`\`
-   **STRICT ADHERENCE TO INTERFACE. The entire response MUST be a single JSON object matching this structure.**

${commonFileStructureInstructions}
${ADVANCED_QUALITY_MANDATE}
${STRIPE_MONETIZATION_INSTRUCTIONS}
${VIDEO_GENERATION_INSTRUCTIONS}

**ULTRA-CRITICAL JSON STRING VALUE ESCAPING (MANDATORY for 'content' fields):**
(EVERY literal newline -> \\\\n; carriage return -> \\\\r; tab -> \\\\t; U+2028 -> \\\\u2028; U+2029 -> \\\\u2029. Double quotes inside strings must be escaped as \\". FAILURE = UNPARSEABLE JSON.)
**CORRECT EXAMPLE for file content:** \`"content": "const msg = 'Hello\\\\nWorld'; alert(msg); // Example with \\"quotes\\" in content."\`

---
**CORE TASK DEFINITION**
${plan ? `
**CRITICAL: You MUST build the application based on the following meticulously detailed project plan. Adhere to it closely.**
**PROJECT PLAN:**
---
${plan}
---
The user's original idea was: "${userInput}"
You must now generate the code that perfectly implements this plan.
` : `
${getModeSpecificInstructions(creationMode)}
---
User Idea for ${creationModeToLabel(creationMode)}: "${userInput}"
`}
---

${mediaInput ? `
**CRITICAL MEDIA INPUT (Type: ${mediaInput.mimeType}):**
- Analyze this media. If image/video, incorporate its style/content meaningfully into the design. Use it as a centerpiece or strong inspiration. If ZIP, use its contents to inform the new, high-quality generation.
` : ''}

${scrapedOrBrowserUrl ? `
**CRITICAL WEB STYLE EMULATION / INSPIRATION:** URL: ${scrapedOrBrowserUrl}
-   **METICULOUSLY emulate and ELEVATE** the visual design, layout, color scheme, typography, and interactive elements. Do not just copy; improve and make it "SOOOOOOO GOOOOOD".
` : `
**Design and Technology Guidelines ("Lovable", "Mind Quest Platform" Style & Advanced - if no URL):**
- Impeccable Visual Detail. Aim for a design that feels like a polished, premium product.
`}

${figmaInspiration ? `
**CRITICAL FIGMA DESIGN INSPIRATION:** Input: "${figmaInspiration.substring(0, 200)}${figmaInspiration.length > 200 ? '...' : ''}"
-   **Masterfully translate and ENHANCE** the described Figma design into an interactive, animated, and visually stunning reality.
` : ''}

**Visual Content (Images & Videos):**
- If visual content is implied, **strategically include \`<img>\` or \`<video>\` tags** in HTML.
- **For all \`<img>\` tags:** Use descriptive \`alt\` attributes. For the \`src\`, use specific, relevant, high-quality placeholder URLs from services like Unsplash or Picsum. For example, for a "Grammy winners" app, use a theme like 'music,album,art' in the URL (e.g., \`https://source.unsplash.com/random/800x600/?music,album,art\`).
- **DO NOT use \`imageGenerationRequests\` field; embed image URLs directly into HTML.**
- For standard placeholder \`<video>\` tags: use placeholder video URLs (e.g., from Pexels, Pixabay, or a generic like Big Buck Bunny if appropriate for testing) and include \`controls\`.
- For AI-generated videos, follow their respective generation request guidelines. Ensure HTML \`<video>\` tags use the specified \`targetFilePath\` as their \`src\`.


${userInput.toLowerCase().includes('/gsap') ? `
**ULTRA-CRITICAL GSAP ANIMATION DIRECTIVE:**
- User explicitly requested GSAP: "${userInput}".
- **MUST** use GSAP for **complex, impressive, and central animations** in \`public/script.js\`.
- **MUST** include GSAP CDN in \`public/index.html\`.
- **The GSAP animation should be a highlight of the generated output.**
` : ''}

Produce an application that isn't just functional but **genuinely impressive and delightful.** Ensure the final output is ONLY the JSON object.
`;

export const PROMPT_TEMPLATE_MODIFY = (
  currentFiles: GeneratedFile[], currentEntryPoint: string,
  userInstruction: string,
  creationMode: CreationMode,
  appName?: string, appDescription?: string,
  scrapedOrBrowserUrl?: string,
  figmaInspiration?: string,
  mediaInput?: { mimeType: string }
): string => `
You are a world-class AI software architect and visionary UI/UX designer. **DRAMATICALLY elevate** the existing multi-file web application based on the user's instruction.
Maintain and **significantly enhance** its "SOOOOOOO GOOOOOD" standard of visual polish, animation quality, "biggggggg" scope (if 'app' mode), and interactive completeness.
Output the *complete, ENHANCED file structure*.

**Current Application Name:** ${appName || 'N/A'}
**Current Application Description:** ${appDescription || 'N/A'}
**Current Creation Mode:** ${creationModeToLabel(creationMode)}
**Current Entry Point:** ${currentEntryPoint}

**Current Project Files (path and snippet):**
---
${currentFiles.map(f => `${f.path}:\n\`\`\`\n${f.content.substring(0, 150)}${f.content.length > 150 ? '...' : ''}\n\`\`\`\n`).join('\\n')}
---

**User's Modification Instruction for ${creationModeToLabel(creationMode)}:** "${userInstruction}"
${userInstruction.toLowerCase().includes('/gsap') ? `
**ULTRA-CRITICAL GSAP ANIMATION DIRECTIVE (MODIFICATION):**
- User requested GSAP: "${userInstruction}".
- **MUST** use/integrate GSAP for **significant, impressive animations** in the relevant JS file.
- If not present, **MUST** add GSAP CDN to the main HTML file.
- **GSAP effects should be a noticeable and delightful improvement.**
` : ''}
---
**MODIFICATION CONTEXT & GUIDELINES**
${getModeSpecificInstructions(creationMode)}
${ADVANCED_QUALITY_MANDATE} (Instruction: REITERATE THE HIGH QUALITY BAR)
${STRIPE_MONETIZATION_INSTRUCTIONS}
${VIDEO_GENERATION_INSTRUCTIONS} (Instruction: You can request NEW videos or request to REPLACE existing video placeholders via new prompts and targetFilePaths)
Instruction for Images: **DO NOT use \`imageGenerationRequests\`. If new images are needed, or existing ones need changing, directly modify the HTML.** For image \`src\` attributes, use specific, relevant, high-quality placeholder URLs from services like Unsplash or Picsum.
Ensure all file paths in generated code (image src, video src, script src, link href) are relative and correct.
---

${mediaInput ? `
**CRITICAL MEDIA INPUT (Type: ${mediaInput.mimeType}):**
- Integrate this media's influence with the text instruction to **transform** the application.
` : ''}

**Output Requirements:** (Strict JSON format, same as initial generation. Note: \`imageGenerationRequests\` is NO LONGER supported)
\`\`\`typescript
interface GeneratedFile { path: string; content: string; }
interface VideoGenRequest { prompt: string; targetFilePath: string; }
interface GeneratedAppPayload { 
  appName?: string; 
  appDescription?: string; 
  files: GeneratedFile[]; 
  entryPoint?: string; 
  videoGenerationRequests?: VideoGenRequest[];
}
\`\`\`
-   **STRICT ADHERENCE TO INTERFACE. The entire response MUST be a single JSON object.**
${commonFileStructureInstructions}

**ULTRA-CRITICAL JSON STRING VALUE ESCAPING (MANDATORY for 'content' fields):**
(Same rules as initial generation. Double quotes inside strings must be escaped as \\". FAILURE = UNPARSEABLE JSON.)

- Return the *complete* code for ALL files, incorporating **transformative changes**. Unchanged files are included. Deleted files are omitted. New files are added.
- **JavaScript Syntax & Execution (Modification):**
    - **CRITICAL: Modified JavaScript MUST BE 100% free of syntax errors and produce visually superior results.**

${scrapedOrBrowserUrl ? `
**CRITICAL WEB STYLE EMULATION / INSPIRATION (for this modification):** URL: ${scrapedOrBrowserUrl}
-   Strongly emulate visual style and **elevate it to the "SOOOOOOO GOOOOOD" standard.**
` : ''}

${figmaInspiration ? `
**CRITICAL FIGMA DESIGN INSPIRATION (for this modification):** Input: "${figmaInspiration.substring(0, 200)}..."
-   Translate and **amplify** the Figma design into a more dynamic and polished interactive experience.
` : ''}

Make the modified application **noticeably more impressive, animated, and delightful.** Ensure the final output is ONLY the JSON object.
`;

export const PROMPT_TEMPLATE_MIX_PROJECTS = (
  projects: Project[]
): string => `
You are an expert AI software architect and visionary UI/UX designer. Your goal is to **intelligently mix and merge multiple existing multi-file web applications into a single, new, cohesive, "biggggggg", and "SOOOOOOO GOOOOOD" application project.**
This is creative fusion: blend features, visual styles, animations, and functionalities into something **genuinely novel and impressive.**

**Output Requirements:** (Strict JSON format. Note: \`imageGenerationRequests\` is NO LONGER supported)
\`\`\`typescript
interface GeneratedFile { path: string; content: string; }
interface VideoGenRequest { prompt: string; targetFilePath: string; }
interface GeneratedAppPayload { 
  appName: string; 
  appDescription: string; 
  files: GeneratedFile[]; 
  entryPoint: string; 
  videoGenerationRequests?: VideoGenRequest[];
}
\`\`\`
-   **STRICT ADHERENCE TO INTERFACE. The entire response MUST be a single JSON object.**
${commonFileStructureInstructions}
${ADVANCED_QUALITY_MANDATE} (Instruction: ENSURE THE MIXED PROJECT MEETS THE HIGH BAR)
${STRIPE_MONETIZATION_INSTRUCTIONS}
${VIDEO_GENERATION_INSTRUCTIONS} (Instruction: You can request NEW videos for the mixed project)
Instruction for Images: **DO NOT use \`imageGenerationRequests\`. For all images in the mixed project, directly embed \`<img>\` tags.** For image \`src\` attributes, use specific, relevant, high-quality placeholder URLs from services like Unsplash or Picsum.

**ULTRA-CRITICAL JSON STRING VALUE ESCAPING (MANDATORY for 'content' fields):**
(Same rules. Double quotes inside strings must be escaped as \\". FAILURE = UNPARSEABLE JSON.)

---
**PROJECTS TO MIX:**
${projects.map((p, index) => `
**Project ${index + 1}: "${p.appName}"**
- Description: ${p.appDescription}
- Original Mode: ${p.creationMode}
- Entry Point: ${p.entryPoint}
- Key Files (path and snippet):
  ${p.files.slice(0, 2).map(f => `  - ${f.path}: ${f.content.substring(0, 80)}...\\n`).join('')}
`).join('\\n\\n')}
---
**CORE TASK: SYNTHESIZE A NEW, SPECTACULAR MULTI-FILE APPLICATION**
1.  **Deeply Analyze Projects:** Understand core strengths, features, styles, and animation techniques.
2.  **Define a Unified, Ambitious Concept:** What groundbreaking new app will this fusion create?
3.  **Design and Implement the File Structure for the new, "SOOOOOOO GOOOOOD" app:**
    *   **appName & appDescription:** Invent a creative, exciting name and compelling description.
    *   **files array:** Construct the complete set of files. This means **thoughtful integration, not just concatenation.** Refactor, rewrite, and create new code to ensure cohesion and quality.
        * Create new \`public/index.html\`, \`style.css\`, \`script.js\`. Incorporate sophisticated animations and interactions.
        * Likely create \`src/\` files for well-organized, complex logic and UI components.
    *   **Ensure all internal references are flawless** within the new structure.
    *   **entryPoint:** Set to the main HTML file (e.g., "public/index.html").
4.  **Prioritize "Biggggggg", "Lovable", "Animated", and "Visually Stunning":** The result must be substantial, a joy to use, highly dynamic, and beautiful.
5.  **JavaScript Quality:** All new/merged JS must be error-free and contribute to a polished, interactive experience.
---
Create a mixed application that is **greater than the sum of its parts and truly wows the user.** Ensure the final output is ONLY the JSON object.
`;

export const PROMPT_TEMPLATE_ENHANCE_USER_PROMPT = (
  originalUserPrompt: string,
  creationMode: CreationMode,
): string => `
You are an expert Prompt Engineer. Your task is to take a user's initial idea for a software project and significantly enhance it into a highly detailed, descriptive, and actionable prompt. This enhanced prompt will be fed to another AI to generate the actual software.

**The enhanced prompt MUST be ONLY plain text. Do NOT wrap it in JSON or markdown.**

**Goal for the Enhanced Prompt:**
-   **Massively Expand Detail:** The enhanced prompt should be much longer and more comprehensive than the original.
-   **Specificity is Key:** Add concrete details about features, visual styling (colors, fonts, layout, mood), interactive elements, animations, content sections, user flows, and overall user experience.
-   **"SOOOOOOO GOOOOOD" Quality:** The enhanced prompt should guide the generation AI to create something truly impressive, visually stunning, and highly engaging – a "flagship product" level output.
-   **Actionable for AI:** Provide enough detail that the generation AI has a clear blueprint.
-   **Maintain User Intent:** Expand on the user's core idea, don't replace it.

**Context:**
-   **Original User Prompt:** "${originalUserPrompt}"
-   **Target Creation Mode:** "${creationModeToLabel(creationMode)}" (e.g., Full Application, Landing Page, UI Component, Animation)

**Instructions for Enhancement:**
1.  **Elaborate on Features:**
    *   If the original prompt is "a to-do app", the enhanced prompt might specify: "a feature-rich to-do application with user authentication, task categorization (work, personal, urgent), due dates, reminders, sub-tasks, progress tracking (e.g., a visual progress bar per category), a 'completed tasks' archive, drag-and-drop reordering, and a dark mode option."
2.  **Describe Visual Style & UI/UX:**
    *   Instead of "a cool landing page", detail: "a modern and sleek landing page for a SaaS product. Use a dark neumorphic design aesthetic with a primary color of deep purple (#6A0DAD) and vibrant teal (#00F5D4) accents. The typography should feature a clean sans-serif like 'Inter' for body text and a more expressive display font like 'Orbitron' for main headings. Ensure ample white space and a clear visual hierarchy. Navigation should be sticky at the top. All interactive elements must have subtle hover animations and satisfying click feedback."
    *   **For images, always instruct the generation AI to use high-quality placeholder URLs (e.g., from Unsplash, Picsum). Example: "Include a hero image. For its src, use a placeholder like \\\`<img src='https://source.unsplash.com/random/1600x900/?technology,abstract' alt='Hero image'>\\\`".**
3.  **Outline Content Sections (especially for Apps/Landing Pages):**
    *   For "a drake page (landing page mode)", expand to: "A visually immersive Drake fan landing page.
        *   **Hero Section:** Full-screen background video of Drake performing (use a placeholder video URL), with overlaid bold text 'Drake: The Official Experience'. Use a high-quality placeholder image of Drake performing: \\\`<img src='https://source.unsplash.com/random/1200x800/?drake,concert,music' alt='Drake concert scene'>\\\` as part of the section design.
        *   **About Section:** Titled 'The Story of a Legend', with parallax scrolling images (use placeholder images of 'studio,music,microphone') and well-formatted text detailing his career milestones.
        *   **Discography Section:** Interactive album covers. Use placeholder images for album covers for 'Her Loss', 'Certified Lover Boy', and 'Scorpion' (e.g., \\\`https://source.unsplash.com/random/400x400/?album,art,abstract\\\`). They should flip on hover to show tracklists and streaming links. Use a carousel for albums.
        *   **Tour Dates Section:** A clean table or card layout for upcoming (fictional) tour dates with 'Buy Tickets' buttons.
        *   **Gallery Section:** A masonry grid of high-quality placeholder photos of Drake (e.g., use themes like 'drake,portrait', 'drake,fashion').
        *   **Footer:** Social media links (Instagram, X, YouTube) and copyright information."
4.  **Suggest Animations and Interactions:**
    *   "The navigation links should have a subtle underline animation on hover. When scrolling, sections should fade in smoothly. Interactive buttons should have a slight press-down effect."
    *   If GSAP is relevant (e.g., user prompt mentioned it or for 'animation' mode): "Utilize GSAP for a stunning entry animation where elements fly in from different directions and settle into place."
5.  **Include a Standard Monetization Template:** Always add a description for a sample monetization feature. For example: "A 'Support the Creator ($1)' button will be included. This will be a non-functional template using Stripe Checkout, demonstrating how the app could be monetized. It will require the app owner to add their own Stripe keys and a backend endpoint to become functional."
6.  **Consider Edge Cases or Advanced Features (if applicable):**
    *   "The data visualization should handle empty states gracefully, displaying a message like 'No data available yet'."
    *   "The component should be responsive, adapting its layout for mobile, tablet, and desktop screens."

**IMPORTANT:**
-   The output should be **ONLY the enhanced prompt text itself.** No explanations, no preambles, no "Here is the enhanced prompt:".
-   Make the enhanced prompt significantly longer and richer than the original.
-   Focus on providing enough detail to enable the generation of a high-quality, "SOOOOOOO GOOOOOD" result for the specified creation mode.

Now, enhance the user's prompt based on these instructions.
`;

// Helper to remove trailing commas from JSON strings and other common AI mistakes
const sanitizeJsonString = (jsonString: string): string => {
  let cleaned = jsonString;
  
  // Remove trailing commas from objects: ,} -> }
  cleaned = cleaned.replace(/,\s*}/g, '}');
  // Remove trailing commas from arrays: ,] -> ]
  cleaned = cleaned.replace(/,\s*]/g, ']');

  // Remove invalid escape characters. E.g. \' -> '
  // This looks for a backslash that is NOT followed by a valid JSON escape sequence character.
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '');

  // Remove extraneous fields like "encoding" that the AI sometimes adds
  cleaned = cleaned.replace(/,\s*"encoding":\s*"[^"]*"/g, '');

  // This regex is designed to catch a specific error pattern where the AI adds
  // an extra empty or newline string after a valid property, before a comma or brace.
  cleaned = cleaned.replace(/(")\s*,\s*""\s*([,}])/g, '$1$2');
  cleaned = cleaned.replace(/(")\s*""\s*([,}])/g, '$1$2');
  cleaned = cleaned.replace(/(")\s*,\s*"\s*"\s*([,}])/g, '$1$2');
  cleaned = cleaned.replace(/("\s*:\s*"[^"]*"\s*),\s*""\s*}/g, '$1}');


  return cleaned;
};

const parseAndValidateJson = (jsonStr: string, provider: AIProvider | 'Unknown') => {
    jsonStr = jsonStr.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
        jsonStr = match[1].trim();
    }
    jsonStr = jsonStr.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    
    // First, try to parse. If it fails, sanitize and retry.
    try {
        return JSON.parse(jsonStr);
    } catch (initialParseError) {
        console.warn(`[${provider}] Initial JSON parsing failed. Attempting to sanitize and retry. Error:`, initialParseError);
        const sanitizedJsonStr = sanitizeJsonString(jsonStr);
        try {
            return JSON.parse(sanitizedJsonStr);
        } catch (finalParseError) {
            console.error(`[${provider}] Problematic JSON string for parsing (even after sanitization):`, sanitizedJsonStr);
            const errorMessage = finalParseError instanceof Error ? finalParseError.message : String(finalParseError);
            const finalErrorMessage = `Failed to parse JSON response from AI (${provider}): ${errorMessage}. The AI's output was likely not in the expected format. Please check the browser console for the raw response.`;
            throw new Error(finalErrorMessage);
        }
    }
};

export const parseToGeneratedPlanPayload = (responseText: string, provider: AIProvider | 'Unknown'): GeneratedPlanPayload => {
    const rawParsedData = parseAndValidateJson(responseText, provider);
    if (typeof rawParsedData.plan !== 'string' || !rawParsedData.plan) {
         console.error(`[${provider}] Parsed plan data has no 'plan' string:`, rawParsedData);
         throw new Error("The AI's response for the plan was not structured correctly (missing 'plan' string).");
    }
    return { plan: rawParsedData.plan };
};


export const parseToGeneratedAppPayload = (responseText: string, provider: AIProvider | 'Unknown'): GeneratedAppPayload => {
  const rawParsedData = parseAndValidateJson(responseText, provider);
  
  const parsedData: GeneratedAppPayload = {
      appName: rawParsedData.appName,
      appDescription: rawParsedData.appDescription,
      files: rawParsedData.files || [], 
      entryPoint: rawParsedData.entryPoint,
      videoGenerationRequests: rawParsedData.videoGenerationRequests || [],
  };

  if (!Array.isArray(parsedData.files) || parsedData.files.length === 0) {
      console.error(`[${provider}] Parsed data has no files or 'files' is not an array:`, parsedData, "Raw AI response snippet:", responseText.substring(0, 500));
      throw new Error("The AI's response was not structured correctly (missing files). Please try again.");
  }

  for (const file of parsedData.files) {
      if (typeof file.path !== 'string' || typeof file.content !== 'string') {
          console.error(`[${provider}] Invalid file object in 'files' array:`, file, "Raw AI response snippet:", responseText.substring(0, 500));
          throw new Error(`Invalid file structure in ${provider} AI response. Each file must have a 'path' and 'content' string.`);
      }
  }

  if (parsedData.videoGenerationRequests && !Array.isArray(parsedData.videoGenerationRequests)) {
      console.warn(`[${provider}] videoGenerationRequests is present but not an array. Ignoring.`);
      parsedData.videoGenerationRequests = [];
  }
  if (parsedData.videoGenerationRequests) {
      for (const req of parsedData.videoGenerationRequests) {
          if (typeof req.prompt !== 'string' || typeof req.targetFilePath !== 'string') {
               console.error(`[${provider}] Invalid videoGenerationRequest object:`, req);
               throw new Error(`Invalid videoGenerationRequest from ${provider}: must have 'prompt' and 'targetFilePath' strings.`);
          }
      }
  }
  
  if (!parsedData.entryPoint) {
      const htmlFiles = parsedData.files.filter(f => f.path.endsWith('.html'));
      if (htmlFiles.find(f => f.path === 'public/index.html')) {
          parsedData.entryPoint = 'public/index.html';
      } else if (htmlFiles.find(f => f.path === 'index.html')) {
          parsedData.entryPoint = 'index.html';
      } else if (htmlFiles.length > 0) {
          parsedData.entryPoint = htmlFiles[0].path; 
      } else {
          console.warn(`[${provider}] No HTML entryPoint specified by AI and no HTML files found. Adding a fallback error page.`);
          parsedData.entryPoint = "public/index.html"; 
          if (!parsedData.files.find(f => f.path === parsedData.entryPoint)) { 
               parsedData.files.push({path: "public/index.html", content: `<html><body><h1>Error: No HTML Content Generated (${provider})</h1><p>The AI did not provide a primary HTML file for the preview.</p></body></html>`});
          }
      }
  }
  return parsedData;
};