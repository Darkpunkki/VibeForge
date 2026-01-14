import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ensureIdeaWorkspace } from './vfPaths.js';

/**
 * Very small "kind" map. Expand as your framework grows.
 */
function resolveKind(wsRootAbs: string, kind: string): string {
  const k = kind.trim();
  // allow explicit relative paths under the idea root
  if (k.includes('/') || k.includes('\\')) return safeJoin(wsRootAbs, k);

  const map: Record<string, string> = {
    'inputs.idea': 'inputs/idea.md',
    'inputs.normalizer_answers': 'inputs/normalizer_answers.md',
    'latest.idea_normalized': 'latest/idea_normalized.md',
    'latest.epics': 'latest/epics.md',
    'latest.features': 'latest/features.md',
    'latest.tasks': 'latest/tasks.md',
    'latest.work_packages': 'latest/work_packages.md',
    'manifest': 'manifest.md',
    'run_log': 'run_log.md',
  };

  const rel = map[k];
  if (!rel) throw new Error(`Unknown kind: ${kind}`);
  return safeJoin(wsRootAbs, rel);
}

function safeJoin(rootAbs: string, rel: string): string {
  const full = path.resolve(rootAbs, rel);
  const root = path.resolve(rootAbs);
  if (!full.startsWith(root)) throw new Error('Path escape blocked');
  return full;
}

export function registerReadWrite(server: McpServer) {
  server.registerTool(
    'vf.read',
    {
      title: 'Read forge artifact',
      description: 'Read a file in docs/forge/ideas/<IDEA_ID>/ by kind or relative path under that idea root.',
      inputSchema: {
        idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
        kind: z.string().describe('A known kind (e.g. latest.idea_normalized) or a relative path under the idea root'),
        repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
      },
    },
    async ({ idea_id, kind, repo_root }: { idea_id: string; kind: string; repo_root?: string }) => {
      const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
      const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);
      const fileAbs = resolveKind(ws.rootAbs, kind);

      const text = await fs.readFile(fileAbs, 'utf8');
      return { content: [{ type: 'text', text }] };
    }
  );

  server.registerTool(
    'vf.write',
    {
      title: 'Write forge artifact',
      description:
        'Write a file in docs/forge/ideas/<IDEA_ID>/ by kind or relative path under that idea root. Modes: overwrite|append.',
      inputSchema: {
        idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
        kind: z.string().describe('A known kind (e.g. latest.idea_normalized) or a relative path under the idea root'),
        mode: z.enum(['overwrite', 'append']).describe('Write mode'),
        content: z.string().describe('Text content to write'),
        repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
      },
    },
    async ({
      idea_id,
      kind,
      mode,
      content,
      repo_root,
    }: {
      idea_id: string;
      kind: string;
      mode: 'overwrite' | 'append';
      content: string;
      repo_root?: string;
    }) => {
      const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
      const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);
      const fileAbs = resolveKind(ws.rootAbs, kind);

      await fs.mkdir(path.dirname(fileAbs), { recursive: true });

      if (mode === 'append') {
        await fs.appendFile(fileAbs, content, 'utf8');
      } else {
        await fs.writeFile(fileAbs, content, 'utf8');
      }

      return { content: [{ type: 'text', text: `Wrote ${kind}` }] };
    }
  );
}
