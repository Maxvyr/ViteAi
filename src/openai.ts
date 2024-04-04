import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_KEY as string,
  dangerouslyAllowBrowser: true,
});
