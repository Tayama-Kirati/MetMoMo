// Thin wrapper around the Anthropic SDK used by every AI feature.
const Anthropic = require('@anthropic-ai/sdk')

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5'

let client = null
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 60_000, maxRetries: 1 })
  return client
}

const isEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY)

/**
 * One request to Claude. Returns the text (or parsed JSON when `schema` is given).
 * Throws on API errors, refusals or truncated output so callers can fall back.
 */
async function ask({ system, messages, schema, maxTokens = 2048, effort = 'low' }) {
  const anthropic = getClient()
  if (!anthropic) throw new Error('AI is not configured (ANTHROPIC_API_KEY missing)')

  const output_config = { effort }
  if (schema) output_config.format = { type: 'json_schema', schema }

  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config,
    // On a safety decline, let the API retry on a fallback model automatically
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  })

  if (response.stop_reason === 'refusal') throw new Error('AI declined this request')
  if (response.stop_reason === 'max_tokens') throw new Error('AI response was cut off')

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()

  return schema ? JSON.parse(text) : text
}

module.exports = { ask, isEnabled, MODEL }
