/** Shared helpers for translating Apifox-exported OpenAPI strings to English. */

const CJK_RE = /[\u4e00-\u9fff]/;

export function hasCjk(text: string): boolean {
  return CJK_RE.test(text);
}

/** e.g. "视频（Videos）" → "Videos", "微调（Fine-tuning）" → "Fine-tuning" */
export function translateParenSegment(segment: string): string {
  const trimmed = segment.trim();
  const paren = trimmed.match(/^(.+?)（([^）]+)）$/);
  if (paren) {
    const en = paren[2].trim();
    if (en && !hasCjk(en)) return en;
  }
  return trimmed;
}

const SEGMENT_PHRASES: Record<string, string> = {
  原生OpenAI格式: 'Native OpenAI format',
  原生Gemini格式: 'Native Gemini format',
  原生Claude格式: 'Native Claude format',
  通义千问OpenAI格式: 'Qwen OpenAI format',
  即梦格式: 'Jimeng format',
  可灵格式: 'Kling format',
  Sora格式: 'Sora format',
  列出模型: 'List models',
  ChatCompletions格式: 'Chat Completions format',
  Responses格式: 'Responses format',
  OpenAI聊天格式: 'OpenAI chat format',
  Gemini原生格式: 'Native Gemini format',
  Gemini文本聊天: 'Gemini text chat',
  Gemini媒体识别: 'Gemini multimodal recognition',
  Gemini图片生成: 'Gemini image generation',
  用户登陆注册: 'User sign-in & registration',
};

export function translateTagPath(tag: string): string {
  return tag
    .split('/')
    .map((part) => {
      const fromParen = translateParenSegment(part);
      if (!hasCjk(fromParen)) return fromParen;
      return SEGMENT_PHRASES[part] ?? SEGMENT_PHRASES[fromParen] ?? fromParen;
    })
    .join(' / ');
}
