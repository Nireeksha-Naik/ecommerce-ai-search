import { Product, SearchResult } from '../types/product';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
let geminiUnavailable = false;
let hasWarnedAIProviderFailure = false;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export interface ParsedIntent {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords: string[];
  rawQuery: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Running: ['running', 'run', 'runner', 'shoe', 'shoes', 'sneaker', 'sneakers', 'jog', 'jogging', 'trail'],
  Audio: ['headphone', 'headphones', 'earbud', 'earbuds', 'earphone', 'earphones', 'audio', 'speaker', 'sound'],
  'Water Bottles': ['bottle', 'bottles', 'hydration', 'flask', 'water'],
  Backpacks: ['backpack', 'backpacks', 'bag', 'bags', 'rucksack', 'pack'],
  Dresses: ['dress', 'dresses', 'gown', 'sundress', 'maxi dress', 'midi dress', 'frock'],
};

// Vocabulary of descriptive feature/tag words the mock NLP engine can
// recognize inside a free-text query.
const FEATURE_VOCAB = [
  'lightweight',
  'wireless',
  'noise cancelling',
  'noise-cancelling',
  'waterproof',
  'water resistant',
  'water-resistant',
  'insulated',
  'breathable',
  'durable',
  'compact',
  'affordable',
  'cheap',
  'sweat resistant',
  'sweat-resistant',
  'leak-proof',
  'leak proof',
  'gym',
  'workout',
  'travel',
  'commute',
  'hiking',
  'outdoor',
  'slim',
  'spacious',
  'stainless steel',
  'bpa-free',
  'bpa free',
  'cushioned',
  'grip',
  'trail',
  'laptop',
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'with', 'and', 'or', 'of', 'to', 'in', 'on',
  'under', 'over', 'below', 'above', 'between', 'me', 'my', 'find',
  'show', 'looking', 'need', 'want', 'best', 'good', 'some', 'that',
  'is', 'are', 'i', 'im', "i'm",
]);

/**
 * ------------------------------------------------------------------
 * PUBLIC ENTRY POINT
 * ------------------------------------------------------------------
 */
export async function searchProductsWithAI(
  query: string,
  products: Product[]
): Promise<SearchResult> {
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      products,
      summary: `Showing all ${products.length} products`,
      aiExplanations: {},
    };
  }

  let intent: ParsedIntent;
  try {
    intent =
      GEMINI_API_KEY || OPENAI_API_KEY
        ? await parseIntentWithAIProvider(trimmed)
        : parseIntentWithMockNLP(trimmed);
  } catch (err) {
    // Any API failure (network, auth, quota) falls back gracefully.
    if (!hasWarnedAIProviderFailure) {
      console.warn('AI provider failed, falling back to mock NLP:', err);
      hasWarnedAIProviderFailure = true;
    }
    intent = parseIntentWithMockNLP(trimmed);
  }

  const scored = products
    .map((product) => scoreProduct(product, intent))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const matchedProducts = scored.map((s) => s.product);

  const aiExplanations: Record<string, string> = {};
  scored.forEach((s) => {
    aiExplanations[s.product.id] = buildExplanation(s.matchedTags, intent);
  });

  const summary = buildSummary(intent, matchedProducts.length);

  return { products: matchedProducts, summary, aiExplanations };
}

/**
 * ------------------------------------------------------------------
 * INTENT PARSING — MOCK NLP ENGINE (no API key required)
 * ------------------------------------------------------------------
 */
export function parseIntentWithMockNLP(query: string): ParsedIntent {
  const lower = query.toLowerCase();

  // --- Budget extraction ---
  // Prices are always INR. Accept an optional ₹ symbol, optional "rs"/"rs."
  // prefix, and comma thousands-separators — "₹5,000", "rs 5000", and
  // "5000" all parse to the same numeric value.
  let maxPrice: number | undefined;
  let minPrice: number | undefined;

  const NUM = '(?:₹|rs\\.?\\s*)?\\s*(\\d[\\d,]*(?:\\.\\d+)?)';

  const underMatch = lower.match(new RegExp(`(?:under|below|less than|<)\\s*${NUM}`));
  if (underMatch) maxPrice = parseFloat(underMatch[1].replace(/,/g, ''));

  const overMatch = lower.match(new RegExp(`(?:over|above|more than|>)\\s*${NUM}`));
  if (overMatch) minPrice = parseFloat(overMatch[1].replace(/,/g, ''));

  const betweenMatch = lower.match(
    new RegExp(`between\\s*${NUM}\\s*(?:and|-)\\s*${NUM}`)
  );
  if (betweenMatch) {
    minPrice = parseFloat(betweenMatch[1].replace(/,/g, ''));
    maxPrice = parseFloat(betweenMatch[2].replace(/,/g, ''));
  }

  // --- Category detection ---
  let category: string | undefined;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      category = cat;
      break;
    }
  }

  // --- Feature/tag keyword detection ---
  const keywords = FEATURE_VOCAB.filter((feature) => lower.includes(feature));

  // --- Fallback: pull remaining meaningful words as loose keywords ---
  const looseWords = lower
    .replace(/[^a-z0-9\s₹]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  looseWords.forEach((w) => {
    if (!keywords.includes(w)) keywords.push(w);
  });

  return { category, minPrice, maxPrice, keywords, rawQuery: query };
}

/**
 * ------------------------------------------------------------------
 * INTENT PARSING — REAL AI PROVIDER (Gemini preferred, OpenAI fallback)
 * ------------------------------------------------------------------
 */
async function parseIntentWithAIProvider(query: string): Promise<ParsedIntent> {
  const prompt = `You are a shopping search assistant for an Indian eCommerce app. All prices are in Indian Rupees (INR). Extract structured search intent from the user's query.
Return ONLY valid JSON (no markdown, no commentary) matching this shape:
{
  "category": "Running" | "Audio" | "Water Bottles" | "Backpacks" | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "keywords": string[]
}
User query: "${query}"`;

  if (GEMINI_API_KEY && !geminiUnavailable) {
    try {
      return await callGemini(prompt, query);
    } catch (err) {
      geminiUnavailable = true;
      if (OPENAI_API_KEY) {
        return callOpenAI(prompt, query);
      }
      throw err;
    }
  }
  if (OPENAI_API_KEY) {
    return callOpenAI(prompt, query);
  }
  return parseIntentWithMockNLP(query);
}

async function callGemini(prompt: string, rawQuery: string): Promise<ParsedIntent> {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  return parseJSONIntent(text, rawQuery);
}

async function callOpenAI(prompt: string, rawQuery: string): Promise<ParsedIntent> {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);

  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '{}';
  return parseJSONIntent(text, rawQuery);
}

function parseJSONIntent(rawText: string, rawQuery: string): ParsedIntent {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      category: parsed.category ?? undefined,
      minPrice: parsed.minPrice ?? undefined,
      maxPrice: parsed.maxPrice ?? undefined,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      rawQuery,
    };
  } catch {
    // Malformed JSON from the model — fall back to local parsing.
    return parseIntentWithMockNLP(rawQuery);
  }
}

/**
 * ------------------------------------------------------------------
 * SCORING
 * ------------------------------------------------------------------
 */
function scoreProduct(
  product: Product,
  intent: ParsedIntent
): { product: Product; score: number; matchedTags: string[] } {
  // Hard budget constraints exclude a product outright.
  if (intent.maxPrice !== undefined && product.price > intent.maxPrice) {
    return { product, score: 0, matchedTags: [] };
  }
  if (intent.minPrice !== undefined && product.price < intent.minPrice) {
    return { product, score: 0, matchedTags: [] };
  }

  // Keep category searches inside the requested category so generic mentions
  // in descriptions do not leak unrelated products into the results.
  if (intent.category && product.category !== intent.category) {
    return { product, score: 0, matchedTags: [] };
  }

  let score = 0;
  const matchedTags: string[] = [];
  const haystack = `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();

  if (intent.category) {
    score += 3;
  }

  intent.keywords.forEach((kw) => {
    const needle = kw.toLowerCase();
    if (haystack.includes(needle)) {
      score += 2;
      const matchingTag = product.tags.find((t) => t.toLowerCase().includes(needle));
      matchedTags.push(matchingTag ?? needle);
    }
  });

  // Give every in-budget category match at least a baseline score so a
  // category-only query still returns results.
  if (score === 0 && intent.category) {
    score = 1;
  }

  return { product, score, matchedTags: Array.from(new Set(matchedTags)) };
}

/**
 * ------------------------------------------------------------------
 * TEXT GENERATION HELPERS
 * ------------------------------------------------------------------
 */
function buildExplanation(matchedTags: string[], intent: ParsedIntent): string {
  const parts: string[] = [];

  if (matchedTags.length > 0) {
    parts.push(matchedTags.slice(0, 3).join(', '));
  }
  if (intent.maxPrice !== undefined) {
    parts.push(`under ₹${intent.maxPrice.toLocaleString('en-IN')} budget`);
  } else if (intent.minPrice !== undefined) {
    parts.push(`above ₹${intent.minPrice.toLocaleString('en-IN')}`);
  }

  if (parts.length === 0) {
    return `✨ Matches: "${intent.rawQuery}"`;
  }
  return `✨ Matches: ${parts.join(' & ')}`;
}

function buildSummary(intent: ParsedIntent, resultCount: number): string {
  if (resultCount === 0) {
    return `No results found for "${intent.rawQuery}". Try removing a filter or broadening your budget.`;
  }

  const descriptors: string[] = [];
  if (intent.keywords.length > 0) {
    descriptors.push(intent.keywords.slice(0, 2).join(' '));
  }
  if (intent.category) {
    descriptors.push(intent.category.toLowerCase());
  }

  const subject = descriptors.length > 0 ? descriptors.join(' ') : 'products';
  const budgetPart =
    intent.maxPrice !== undefined
      ? ` under ₹${intent.maxPrice.toLocaleString('en-IN')}`
      : intent.minPrice !== undefined
      ? ` over ₹${intent.minPrice.toLocaleString('en-IN')}`
      : '';

  return `Found ${resultCount} ${subject}${budgetPart} matching "${intent.rawQuery}"`;
}