import * as z from 'zod';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ensureIdeaWorkspace } from './vfPaths.js';
/**
 * Very small "kind" map. Expand as your framework grows.
 */
function resolveKind(wsRootAbs, kind) {
    const k = kind.trim();
    // allow explicit relative paths under the idea root
    if (k.includes('/') || k.includes('\\'))
        return safeJoin(wsRootAbs, k);
    const map = {
        'inputs.idea': 'inputs/idea.md',
        'inputs.normalizer_answers': 'inputs/normalizer_answers.md',
        'latest.idea_normalized': 'latest/idea_normalized.md',
        'latest.concept_summary': 'latest/concept_summary.md',
        'latest.epics': 'latest/epics.md',
        'latest.epics_backlog': 'latest/epics_backlog.md',
        'latest.features': 'latest/features.md',
        'latest.features_backlog': 'latest/features_backlog.md',
        'latest.tasks': 'latest/tasks.md',
        'latest.tasks_backlog': 'latest/tasks_backlog.md',
        'latest.work_packages': 'latest/work_packages.md',
        'latest.PROJECT_ARCHITECTURE': 'latest/PROJECT_ARCHITECTURE.md',
        'manifest': 'manifest.md',
        'run_log': 'run_log.md',
    };
    const rel = map[k];
    if (!rel)
        throw new Error(`Unknown kind: ${kind}`);
    return safeJoin(wsRootAbs, rel);
}
function safeJoin(rootAbs, rel) {
    const full = path.resolve(rootAbs, rel);
    const root = path.resolve(rootAbs);
    if (!full.startsWith(root))
        throw new Error('Path escape blocked');
    return full;
}
export function registerReadWrite(server) {
    server.registerTool('vf.read', {
        title: 'Read forge artifact',
        description: 'Read a file in docs/forge/ideas/<IDEA_ID>/ by kind or relative path under that idea root.',
        inputSchema: {
            idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
            kind: z.string().describe('A known kind (e.g. latest.idea_normalized) or a relative path under the idea root'),
            repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
        },
    }, async ({ idea_id, kind, repo_root }) => {
        const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
        const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);
        const fileAbs = resolveKind(ws.rootAbs, kind);
        const text = await fs.readFile(fileAbs, 'utf8');
        return { content: [{ type: 'text', text }] };
    });
    server.registerTool('vf.write', {
        title: 'Write forge artifact',
        description: 'Write a file in docs/forge/ideas/<IDEA_ID>/ by kind or relative path under that idea root. Modes: overwrite|append.',
        inputSchema: {
            idea_id: z.string().describe('Idea folder name like IDEA-0001-first-idea'),
            kind: z.string().describe('A known kind (e.g. latest.idea_normalized) or a relative path under the idea root'),
            mode: z.enum(['overwrite', 'append']).describe('Write mode'),
            content: z.string().describe('Text content to write'),
            repo_root: z.string().optional().describe('Absolute path to repo root (optional; defaults to process.cwd()).'),
        },
    }, async ({ idea_id, kind, mode, content, repo_root, }) => {
        const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
        const ws = await ensureIdeaWorkspace(repoRootAbs, idea_id);
        const fileAbs = resolveKind(ws.rootAbs, kind);
        await fs.mkdir(path.dirname(fileAbs), { recursive: true });
        if (mode === 'append') {
            await fs.appendFile(fileAbs, content, 'utf8');
        }
        else {
            await fs.writeFile(fileAbs, content, 'utf8');
        }
        return { content: [{ type: 'text', text: `Wrote ${kind}` }] };
    });
}
