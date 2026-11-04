/**
 * Build English OpenAPI JSON from the Chinese export under `openapi/generated/zh`.
 *
 * Writes parallel files to `openapi/generated/en` (same paths/filenames). MDX keeps
 * canonical keys `openapi/generated/...`; runtime picks zh vs en by docs locale.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import {
  hasCjk,
  translateTagPath,
} from './openapi-translate-utils';

const glossaryPath = path.join(process.cwd(), 'scripts/openapi-en-glossary.json');

const SOURCE_DIR =
  process.env.OPENAPI_ZH_DIR?.trim() ||
  path.join(process.cwd(), 'openapi/generated/zh');

const OUT_DIR =
  process.env.OPENAPI_EN_DIR?.trim() ||
  path.join(process.cwd(), 'openapi/generated/en');

const TRANSLATABLE_KEYS = new Set([
  'description',
  'summary',
  'title',
  'name',
]);

const GLOSSARY: Record<string, string> = JSON.parse(
  readFileSync(glossaryPath, 'utf8')
) as Record<string, string>;

const EMOJI_AUTH: Record<string, string> = {
  '🔐 需要登录（User权限）': '🔐 Login required (user role)',
  '🔑 需要令牌认证（TokenAuth）': '🔑 Bearer token required (TokenAuth)',
  '👨‍💼 需要管理员权限（Admin）': '👨‍💼 Admin role required',
  '👑 需要超级管理员权限（Root）': '👑 Root super-admin required',
  '👑 需要超级管理员权限（Root）+ 安全验证':
    '👑 Root super-admin required + security verification',
  '🔓 无需鉴权': '🔓 No authentication required',
  '🔓 无需鉴权（Webhook回调）': '🔓 No authentication (webhook callback)',
  '🔓 无需鉴权（OAuth回调）': '🔓 No authentication (OAuth callback)',
  '🔓 无需鉴权（支付回调）': '🔓 No authentication (payment callback)',
  '🔓 无需鉴权（登录流程）': '🔓 No authentication (sign-in flow)',
  '🔓 无需鉴权（可选登录）': '🔓 No authentication (optional login)',
  '🔓 无需鉴权（通过令牌查询）':
    '🔓 No authentication (query via token)',
};

const VERB_PREFIXES: Array<[RegExp, string]> = [
  [/^获取(.+)$/, 'Get $1'],
  [/^创建(.+)$/, 'Create $1'],
  [/^删除(.+)$/, 'Delete $1'],
  [/^更新(.+)$/, 'Update $1'],
  [/^搜索(.+)$/, 'Search $1'],
  [/^列出(.+)$/, 'List $1'],
  [/^发起(.+)$/, 'Initiate $1'],
  [/^开始(.+)$/, 'Start $1'],
  [/^完成(.+)$/, 'Complete $1'],
  [/^绑定(.+)$/, 'Bind $1'],
  [/^禁用(.+)$/, 'Disable $1'],
  [/^启用(.+)$/, 'Enable $1'],
  [/^设置(.+)$/, 'Set up $1'],
  [/^重置(.+)$/, 'Reset $1'],
  [/^发送(.+)$/, 'Send $1'],
  [/^测试(.+)$/, 'Test $1'],
  [/^修复(.+)$/, 'Fix $1'],
  [/^复制(.+)$/, 'Copy $1'],
  [/^添加(.+)$/, 'Add $1'],
  [/^编辑(.+)$/, 'Edit $1'],
  [/^生成(.+)$/, 'Generate $1'],
  [/^查询(.+)$/, 'Query $1'],
  [/^检查(.+)$/, 'Check $1'],
  [/^转换(.+)$/, 'Convert $1'],
  [/^迁移(.+)$/, 'Migrate $1'],
  [/^初始化(.+)$/, 'Initialize $1'],
  [/^注销(.+)$/, 'Log out $1'],
  [/^管理(.+)$/, 'Manage $1'],
  [/^批量(.+)$/, 'Batch $1'],
  [/^同步(.+)$/, 'Sync $1'],
  [/^预览(.+)$/, 'Preview $1'],
  [/^使用(.+)$/, 'Use $1'],
  [/^将(.+)翻译为英文文本$/, 'Translate $1 to English text'],
  [/^将(.+)转换为向量嵌入$/, 'Create embedding vectors for $1'],
  [/^将(.+)转换为音频$/, 'Convert $1 to audio'],
  [/^将(.+)转换为文本$/, 'Transcribe $1 to text'],
  [/^基于给定提示创建文本补全$/, 'Create a text completion for the given prompt'],
  [/^根据对话历史创建模型响应。支持流式和非流式响应。\n\n兼容 OpenAI Chat Completions API。\n$/, 'Create a model response from conversation history. Supports streaming and non-streaming responses.\n\nCompatible with the OpenAI Chat Completions API.\n'],
];

const NOUN_PHRASES: Record<string, string> = {
  令牌: 'token',
  所有令牌: 'all tokens',
  指定令牌: 'token by ID',
  任务: 'tasks',
  所有任务: 'all tasks',
  个人任务: 'your tasks',
  供应商: 'vendor',
  所有供应商: 'all vendors',
  指定供应商: 'vendor by ID',
  兑换码: 'redemption code',
  所有兑换码: 'all redemption codes',
  指定兑换码: 'redemption code by ID',
  无效兑换码: 'invalid redemption codes',
  分组: 'groups',
  所有分组: 'all groups',
  预填分组: 'prefill group',
  验证状态: 'verification status',
  历史日志: 'historical logs',
  所有日志: 'all logs',
  个人日志: 'your logs',
  日志统计: 'log statistics',
  模型: 'model metadata',
  指定模型: 'model by ID',
  缺失模型: 'missing models',
  上游模型: 'upstream models',
  渠道: 'channel',
  所有渠道: 'all channels',
  指定渠道: 'channel by ID',
  已禁用渠道: 'disabled channels',
  标签模型: 'tag models',
  渠道模型列表: 'channel model list',
  渠道密钥: 'channel key',
  标签渠道: 'tagged channels',
  用户信息: 'current user profile',
  当前用户分组: 'current user groups',
  用户分组列表: 'user group list',
  用户可用模型: 'models available to the user',
  所有用户: 'all users',
  指定用户: 'user by ID',
  充值记录: 'top-up records',
  所有充值记录: 'all top-up records',
  用户充值记录: 'user top-up records',
  充值信息: 'top-up info',
  支付金额: 'payment amount',
  初始化状态: 'setup status',
  可同步渠道: 'channels available to sync',
  关于信息: 'about info',
  首页内容: 'home page content',
  定价信息: 'pricing info',
  隐私政策: 'privacy policy',
  倍率配置: 'ratio configuration',
  系统状态: 'system status',
  用户协议: 'user agreement',
  系统选项: 'system options',
  上游倍率: 'upstream ratios',
  公告: 'notices',
  邀请码: 'referral code',
  访问令牌: 'access token',
  邀请额度: 'referral quota',
  用户状态: 'user status',
  用户设置: 'user settings',
  个人额度数据: 'your quota usage',
  所有额度数据: 'all quota usage',
  个人日志统计: 'your log statistics',
  通过令牌获取日志: 'logs for a token',
  上游模型同步: 'upstream model sync',
  上游模型列表: 'upstream model list',
  所有模型元数据: 'all model metadata',
  已启用模型列表: 'enabled models',
  模型元数据: 'model metadata',
  模型列表: 'model list',
  '2FA统计': '2FA statistics',
  '2FA状态': '2FA status',
  备用码: 'backup codes',
  Passkey状态: 'Passkey status',
  用户Passkey: 'user Passkey',
  用户2FA: 'user 2FA',
  控制台设置: 'console settings',
  令牌使用情况: 'token usage',
  视频内容: 'video content',
  视频任务状态: 'video task status',
  视频生成任务状态: 'video generation task status',
  Midjourney任务: 'Midjourney tasks',
  个人Midjourney任务: 'your Midjourney tasks',
  'Uptime Kuma状态': 'Uptime Kuma status',
  微调任务事件: 'fine-tuning job events (not implemented)',
  微调任务详情: 'fine-tuning job details (not implemented)',
  微调任务: 'fine-tuning jobs (not implemented)',
  文件内容: 'file content (not implemented)',
  文件信息: 'file info (not implemented)',
  文件: 'files (not implemented)',
};

function translateNounPhrase(phrase: string): string {
  const trimmed = phrase.trim();
  if (NOUN_PHRASES[trimmed]) return NOUN_PHRASES[trimmed];
  if (GLOSSARY[trimmed]) return GLOSSARY[trimmed];
  if (hasCjk(trimmed)) return trimmed;
  return trimmed;
}

function applyVerbRules(text: string): string | null {
  for (const [re, template] of VERB_PREFIXES) {
    const m = text.match(re);
    if (!m) continue;
    if (template.includes('$1') && m[1]) {
      const obj = translateNounPhrase(m[1]);
      return template.replace('$1', obj);
    }
    return template;
  }
  return null;
}

export function translateOpenApiString(text: string, context?: { isTag?: boolean }): string {
  if (!text || !hasCjk(text)) return text;

  if (context?.isTag) {
    const tag = translateTagPath(text);
    if (!hasCjk(tag)) return tag;
  }

  if (GLOSSARY[text]) return GLOSSARY[text];
  if (EMOJI_AUTH[text]) return EMOJI_AUTH[text];

  const verb = applyVerbRules(text.trim());
  if (verb && !hasCjk(verb)) return verb;

  return GLOSSARY[text] ?? text;
}

function translateValue(key: string, value: unknown, pathKeys: string[]): unknown {
  if (typeof value === 'string') {
    if (key === 'name' && pathKeys.includes('tags')) {
      return translateOpenApiString(value, { isTag: true });
    }
    if (TRANSLATABLE_KEYS.has(key)) {
      if (key === 'name' && !pathKeys.includes('tags')) {
        return value;
      }
      return translateOpenApiString(value, {
        isTag: key === 'name' && pathKeys.at(-1) === 'tags',
      });
    }
    if (key === 'examples' || pathKeys.includes('examples')) {
      return translateOpenApiString(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    const isTagArray =
      pathKeys.at(-1) === 'tags' &&
      value.every((v) => typeof v === 'string' || (v && typeof v === 'object'));
    return value.map((item, i) => {
      if (typeof item === 'string' && (isTagArray || pathKeys.at(-1) === 'tags')) {
        return translateOpenApiString(item, { isTag: true });
      }
      return translateValue(String(i), item, [...pathKeys, String(i)]);
    });
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('x-apifox')) {
        out[k] = v;
        continue;
      }
      out[k] = translateValue(k, v, [...pathKeys, k]);
    }
    return out;
  }

  return value;
}

async function walkJsonFiles(dir: string, acc: string[] = []): Promise<string[]> {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walkJsonFiles(p, acc);
    else if (ent.name.endsWith('.json')) acc.push(p);
  }
  return acc;
}

function collectRemainingCjk(obj: unknown, key: string | null, out: Set<string>) {
  if (typeof obj === 'string') {
    if (key && (TRANSLATABLE_KEYS.has(key) || key === 'examples') && hasCjk(obj)) {
      out.add(obj);
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'string' && hasCjk(item)) out.add(item);
      else collectRemainingCjk(item, null, out);
    }
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('x-apifox')) continue;
      collectRemainingCjk(v, k, out);
    }
  }
}

async function main() {
  const files = await walkJsonFiles(SOURCE_DIR);
  const remaining = new Set<string>();

  for (const file of files) {
    const rel = path.relative(SOURCE_DIR, file);
    const outFile = path.join(OUT_DIR, rel);
    await mkdir(path.dirname(outFile), { recursive: true });
    const raw = await readFile(file, 'utf8');
    const doc = JSON.parse(raw) as unknown;
    const translated = translateValue('root', doc, []);
    await writeFile(outFile, `${JSON.stringify(translated, null, 2)}\n`, 'utf8');
    collectRemainingCjk(translated, null, remaining);
  }

  console.log(
    `✅ Wrote ${files.length} English OpenAPI files to ${OUT_DIR} (from ${SOURCE_DIR})`
  );
  if (remaining.size > 0) {
    console.warn(`⚠ ${remaining.size} Chinese strings remain (add to openapi-en-glossary.json):`);
    for (const s of [...remaining].sort((a, b) => b.length - a.length).slice(0, 30)) {
      console.warn(`  - ${JSON.stringify(s.slice(0, 120))}${s.length > 120 ? '…' : ''}`);
    }
    process.exitCode = 1;
  }
}

const isDirectRun =
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
  process.argv[1]?.endsWith('translate-openapi-generated.ts');

if (isDirectRun) {
  main().catch((err) => {
    console.error('❌ translate-openapi-generated failed:', err);
    process.exit(1);
  });
}
