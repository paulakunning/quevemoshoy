import "server-only";
import { createGroq, type GroqLanguageModelChatOptions } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import { env } from "@/lib/env";
import { FILTER_GENRES, filtersSchema, type Filters } from "./schemas";

const SYSTEM_PROMPT = `You turn a request for TV shows into search filters.
The genres you can use are: ${FILTER_GENRES.join(", ")}.
Rules:
- Use only what the request says. Do not guess or add genres it does not ask for.
- "corto", "cortito" or "short" means maxRuntime 30.
- "nada de X", "sin X" or "no X" means X goes in exclude.
- The request can be in any language.
- If you do not understand the request, leave include and exclude empty and maxRuntime null.`;

export type TextToFiltersResult =
  { status: "ok"; filters: Filters; tokens: number } | { status: "error" };

// Never throws: a slow, down or misconfigured AI becomes { status: "error" }
export async function textToFilters(
  text: string,
): Promise<TextToFiltersResult> {
  try {
    const groq = createGroq({ apiKey: env("GROQ_API_KEY") });
    const { output, usage } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      // The model can only answer with this shape, so the request text
      // can't make it do anything other than pick filters from the list
      output: Output.object({ schema: filtersSchema }),
      system: SYSTEM_PROMPT,
      prompt: text,
      temperature: 0,
      timeout: 10_000,
      providerOptions: {
        groq: {
          reasoningEffort: "low",
        } satisfies GroqLanguageModelChatOptions,
      },
    });
    return { status: "ok", filters: output, tokens: usage.totalTokens ?? 0 };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}
