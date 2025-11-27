import { GoogleGenAI, Type } from "@google/genai";
import type { Teacher, TeacherStats } from '../types';
import { translations } from '../i18n';

const getApiKey = (): string => {
  // La clé fournie par l'utilisateur a la priorité la plus élevée
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) {
    return storedKey;
  }
  
  // Se rabattre sur la clé fournie par l'environnement (par exemple, dans AI Studio)
  const apiKey = process.env.API_KEY;
  if (apiKey) {
      return apiKey;
  }

  // Si aucune n'est disponible, lancer une erreur.
  throw new Error("Clé API non trouvée. Veuillez définir votre clé API Gemini dans les paramètres de l'application.");
};

export const getImprovementSuggestions = async (
  stats: TeacherStats,
  teacherCount: number,
  sessionCount: number,
  hallCount: number,
  lang: 'ar' | 'en' | 'fr'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const statsSummary = Object.values(stats)
      .map(s => translations[lang].geminiStatsSummaryLine.replace('{name}', s.name).replace('{count}', s.count.toString()))
      .join('\n');

    const prompt = translations[lang].geminiSuggestionsPrompt
      .replace('{teacherCount}', teacherCount.toString())
      .replace('{sessionCount}', sessionCount.toString())
      .replace('{hallCount}', hallCount.toString())
      .replace('{statsSummary}', statsSummary);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error)
  {
    console.error("Error fetching suggestions from Gemini API:", error);
    throw error; // Re-throw the original error for the UI to handle.
  }
};

// FIX: Corrected the return type to match the implementation and usage.
// The function returns teacher objects without the 'availability' property.
export const extractTeachersFromImage = async (base64Image: string, mimeType: string, lang: 'ar' | 'en' | 'fr'): Promise<Omit<Teacher, 'id' | 'availability'>[]> => {
  try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });

      const prompt = translations[lang].geminiImageExtractionPrompt;

      const imagePart = {
          inlineData: {
              data: base64Image,
              mimeType: mimeType,
          },
      };

      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING, description: translations[lang].geminiSchemaName },
                          subject: { type: Type.STRING, description: translations[lang].geminiSchemaSubject },
                          maxSessions: { type: Type.INTEGER, description: translations[lang].geminiSchemaMaxSessions },
                          notes: { type: Type.STRING, description: translations[lang].geminiSchemaNotes }
                      },
                       required: ["name", "subject", "maxSessions"]
                  }
              }
          }
      });
      
      const jsonText = response.text.trim();
      const parsedData = JSON.parse(jsonText);

      if (!Array.isArray(parsedData)) {
          throw new Error("AI response is not an array.");
      }

      return parsedData.map(item => ({
          name: item.name || '',
          subject: item.subject || '',
          maxSessions: typeof item.maxSessions === 'number' ? item.maxSessions : 4,
          notes: item.notes || '',
      }));

  } catch (error) {
      console.error("Error extracting teachers from image via Gemini API:", error);
      if (error instanceof SyntaxError) {
           throw new Error(translations[lang].importErrorAIParse);
      }
      // Re-throw the original error for the UI to handle API key issues.
      throw error;
  }
};