import { GoogleGenAI } from "@google/genai";
import { GeneratorInputs, AnalysisResult } from "../types";
import { GENERATOR_SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from "../constants";

// Helper to get API Key
const getApiKey = () => process.env.API_KEY || '';

// Helper for file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. Affiliate Content Generator
export const generateAffiliateContent = async (inputs: GeneratorInputs): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  // Replace placeholders
  let prompt = USER_PROMPT_TEMPLATE
    .replace('{{product_link}}', inputs.productLink)
    .replace('{{visual_style}}', inputs.visualStyle)
    .replace('{{ratio}}', inputs.ratio)
    .replace('{{tone}}', inputs.tone);
    
  // Handle the {{index}} loop in instructions by leaving it as instruction, 
  // but the template above implies the AI iterates. The template string loop 
  // isn't a JS loop, it's part of the text prompt block.
  // We just send the template as is (after var replacement).

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: GENERATOR_SYSTEM_PROMPT,
        temperature: 0.7, // Creativity balance
      }
    });

    const text = response.text || "No response generated.";

    // Parse the output to separate General Analysis from Angles
    // We look for "=== 10 ANGLE OUTPUT ==="
    const parts = text.split('=== 10 ANGLE OUTPUT ===');
    const generalAnalysis = parts[0] || "";
    const anglesSection = parts[1] || "";

    // Split angles by "--- ANGLE"
    const rawAngles = anglesSection.split('--- ANGLE').filter(a => a.trim().length > 10);
    
    const parsedAngles = rawAngles.map((rawContent, idx) => {
      // The split removes the header, so we can clean up the index number if it remains
      let cleanContent = rawContent;
      const firstLineBreak = cleanContent.indexOf('\n');
      if (firstLineBreak > -1) {
         // Optionally clean the first line if it's just a number
      }
      return {
        title: `Angle ${idx + 1}`,
        content: `--- ANGLE ${idx + 1}${cleanContent}` // Re-add header for display context
      };
    });

    return {
      raw: text,
      generalAnalysis,
      angles: parsedAngles
    };

  } catch (error) {
    console.error("Error generating affiliate content:", error);
    throw error;
  }
};

// 2. Image Editor (Gemini 2.5 Flash Image)
export const editImage = async (file: File, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const base64Data = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt || "Edit this image to look more cinematic." }
        ]
      }
    });

    // Check for inlineData (image) in response
    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image returned from the model. Try a different prompt.");

  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

// 3. Video Animation (Veo 3.1)
export const animateImage = async (file: File, prompt?: string): Promise<string> => {
  // Check for Paid API Key for Veo
  // Using explicit cast to any to avoid conflict with global AIStudio type if present
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      throw new Error("API_KEY_MISSING");
    }
  }

  // Use a fresh instance to pick up the potentially newly selected key
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const base64Data = await fileToGenerativePart(file);

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Animate this image cinematically",
      image: {
        imageBytes: base64Data,
        mimeType: file.type
      },
      config: {
        numberOfVideos: 1,
        // Veo fast preview often defaults, but let's try to infer aspect from input if possible,
        // or default to landscape. Since we can't easily detect aspect ratio here without DOM,
        // we will default to 16:9 for safety or let the model decide if we omit.
        // The prompt rules say "can be 16:9 or 9:16".
        aspectRatio: '9:16', // TikTok style default
        resolution: '720p'
      }
    });

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned.");
    }

    // Append API Key to fetch
    const finalUrl = `${videoUri}&key=${getApiKey()}`;
    return finalUrl;

  } catch (error) {
    console.error("Error animating image:", error);
    throw error;
  }
};
