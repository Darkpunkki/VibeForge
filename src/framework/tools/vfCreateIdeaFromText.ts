import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { ensureIdeaWorkspace, IDEAS_REL } from './vfPaths.js';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'idea';
}

async function nextIdeaNumber(repoRootAbs: string): Promise<number> {
  const ideasDirAbs = path.join(repoRootAbs, IDEAS_REL);
  await fs.mkdir(ideasDirAbs, { recursive: true });

  const entries = await fs.readdir(ideasDirAbs, { withFileTypes: true });
  let maxN = 0;
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const m = /^IDEA-(\d{4})-/.exec(ent.name);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n)) maxN = Math.max(maxN, n);
  }
  return maxN + 1;
}

export function registerCreateIdeaFromText(server: McpServer) {
  server.registerTool(
    'vf.create_idea_from_text',
    {
      title: 'Create idea folder from text',
      description:
        'Allocates a new IDEA-XXXX-<slug> folder under docs/forge/ideas/, creates inputs/latest/runs, and initializes manifest.md + run_log.md.',
      inputSchema: {
        initial_text: z.string().describe('Free-form idea text; used to derive a folder slug'),
        repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
      },
    },
    async ({ initial_text, repo_root }: { initial_text: string; repo_root?: string }) => {
      const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();

      const n = await nextIdeaNumber(repoRootAbs);
      const firstLine = (initial_text.split('\n')[0] ?? initial_text).trim();
      const slug = slugify(firstLine || initial_text);
      const ideaId = `IDEA-${String(n).padStart(4, '0')}-${slug}`;

      const ws = await ensureIdeaWorkspace(repoRootAbs, ideaId);

      return {
        content: [{ type: 'text', text: `Created idea: ${ideaId}` }],
        structuredContent: ws,
      };
    }
  );
}
