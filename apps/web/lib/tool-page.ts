import type { Metadata } from 'next';
import { getMessages } from '@lucky/content';
import { alternatesFor, resolveLocale } from './site';
import { TOOL_PATHS, toolDescription, toolLabel, type ToolKey } from './tools';

/** 工具页通用的 SEO 元数据 */
export async function toolMetadata(params: Promise<{ locale: string }>, key: ToolKey): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const m = getMessages(locale);
  return { title: toolLabel(key, m, locale), description: toolDescription(key, m), alternates: alternatesFor(locale, TOOL_PATHS[key]) };
}
