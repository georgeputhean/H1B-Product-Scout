import { GoogleGenAI, Type } from "@google/genai";
import { Company } from "../types";

// Helper to validate/clean data
const cleanCompanyData = (data: any, seriesLabel: string): Company[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name || "Unknown Company",
    series: item.series || seriesLabel,
    industry: item.industry || "Tech",
    location: item.location || "USA",
    h1b_likelihood: item.h1b_likelihood || "Unknown",
    roles: Array.isArray(item.roles) ? item.roles : ["Product Manager"],
    website: item.website || "",
    description: item.description || "",
    reasoning: item.reasoning || "Matched search criteria",
  }));
};

export const fetchCompaniesForSeries = async (
  seriesLabel: string,
  apiKey: string,
  regionalOnly: boolean = false
): Promise<Company[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  const regionalInstruction = regionalOnly 
    ? `STRICTLY focus only on companies that have open or recent PRODUCT ROLES (Product Manager, Product Analyst, etc.) specifically located in New York (NY), Pennsylvania (PA), New Jersey (NJ), or Delaware (DE). 
       The COMPANY itself does not need to be headquartered there, but the ROLES identified must be based in one of these four states (Office-based or Hybrid in-region).` 
    : "Focus on USA-based companies generally.";

  const prompt = `
    Find a COMPREHENSIVE list of at least 60 unique, active, and high-growth startup companies that have recently raised a ${seriesLabel} round of funding (between 2023 and 2025). 
    
    ${regionalInstruction}

    Focus specifically on companies that:
    1. Are in high-growth sectors (AI, Fintech, Healthtech, SaaS, Enterprise Software).
    2. Are actively hiring or have recently hired for Product Manager, Product Analyst, Growth Product Manager, or Growth Analyst roles.
    3. Are known to be H1B friendly or generally hire international talent (large enough to sponsor).
    
    Use Google Search to verify their recent funding status, specific JOB LOCATIONS for product roles, and activity.
    
    Return the data as a JSON array. Ensure the 'location' field reflects the city and state where the PRODUCT ROLES are based (e.g., 'New York, NY' or 'Philadelphia, PA').
    
    Because I need a large volume of data (50+ items), please be thorough and include as many valid entries as possible that meet these specific criteria.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Company Name" },
              series: { type: Type.STRING, description: "Funding Series (e.g. Series C)" },
              industry: { type: Type.STRING, description: "Primary Industry" },
              location: { type: Type.STRING, description: "Role Location (City, State) - Must be in NY, PA, NJ, or DE if requested" },
              h1b_likelihood: { 
                type: Type.STRING, 
                enum: ["High", "Medium", "Low", "Unknown"],
                description: "Estimated likelihood of H1B sponsorship"
              },
              roles: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Relevant product roles currently or recently open in the specified area"
              },
              website: { type: Type.STRING, description: "Company website URL" },
              description: { type: Type.STRING, description: "Short description" },
              reasoning: { type: Type.STRING, description: "Brief reason why they fit (e.g. Active product hub in NY)" }
            },
            required: ["name", "series", "industry", "h1b_likelihood", "roles", "location"]
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return cleanCompanyData(parsed, seriesLabel);

  } catch (error) {
    console.error(`Error fetching data for ${seriesLabel}:`, error);
    throw error;
  }
};