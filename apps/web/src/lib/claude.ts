// Re-exports Gemini abstraction under the old module path.
// Routes that import from '@/lib/claude' continue to work unchanged.
export { MODEL, generate, generateWithTools, buildUserContextSystem, logUsage } from './gemini'
export type { GeminiContent, GeminiPart, FunctionDeclaration } from './gemini'
