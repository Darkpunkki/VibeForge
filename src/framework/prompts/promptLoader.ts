import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

export type PromptFile = {
  name: string;
  title: string;
  description: string;
  inputSchema?: Record<string, any>;
  template: string;
  meta: Record<string, any>;
};

export async function loadPromptFiles(promptsDirUrl: URL): Promise<PromptFile[]> {
  const dirPath = fileURLToPath(promptsDirUrl);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const out: PromptFile[] = [];
  for (const ent of entries) {
    if (!ent.isFile() || !ent.name.endsWith('.md')) continue;

    const fullPath = path.join(dirPath, ent.name);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { meta, body } = parseFrontmatterYaml(raw);

    const stem = ent.name.replace(/\.md$/, '');
    const name = String(meta.name ?? stem);
    const title = String(meta.title ?? stem);
    const description = String(meta.description ?? '');

    const inputs = (meta.inputs ??
      (meta['argument-hint'] ? { arguments: 'string' } : {})) as Record<string, any>;

    out.push({
      name,
      title,
      description,
      inputSchema: inputs,
      template: body.trim(),
      meta,
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function parseFrontmatterYaml(raw: string): { meta: Record<string, any>; body: string } {
  const fm = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/m.exec(raw);
  if (!fm) return { meta: {}, body: raw };

  const metaText = fm[1];
  const body = fm[2];

  let meta: Record<string, any> = {};
  try {
    const parsed = parseYaml(metaText);
    if (parsed && typeof parsed === 'object') meta = parsed as Record<string, any>;
  } catch {
    meta = {};
  }

  return { meta, body };
}
