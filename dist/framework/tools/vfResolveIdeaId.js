import * as z from 'zod';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { IDEAS_REL } from './vfPaths.js';
function isShortId(s) {
    return /^IDEA-\d{4}$/.test(s);
}
export function registerResolveIdeaId(server) {
    server.registerTool('vf.resolve_idea_id', {
        title: 'Resolve IDEA id to idea folder',
        description: 'Resolves an IDEA reference (IDEA-0001 or IDEA-0001-slug) to the actual idea folder name under docs/forge/ideas/.',
        inputSchema: {
            idea_ref: z.string().describe('IDEA-0001 OR IDEA-0001-some-slug'),
            repo_root: z.string().optional().describe('Absolute repo root; defaults to process.cwd()'),
        },
    }, async ({ idea_ref, repo_root }) => {
        const repoRootAbs = repo_root ? path.resolve(repo_root) : process.cwd();
        const ideasDirAbs = path.join(repoRootAbs, IDEAS_REL);
        const ref = idea_ref.trim();
        await fs.mkdir(ideasDirAbs, { recursive: true });
        // If they passed a full folder name and it exists, accept it.
        const fullCandidate = path.join(ideasDirAbs, ref);
        try {
            const st = await fs.stat(fullCandidate);
            if (st.isDirectory()) {
                return {
                    content: [{ type: 'text', text: `Resolved: ${ref}` }],
                    structuredContent: { idea_id: ref },
                };
            }
        }
        catch {
            // continue
        }
        // If short ID, match prefix "IDEA-0001-"
        if (!isShortId(ref)) {
            throw new Error(`Cannot resolve "${ref}". Provide IDEA-XXXX or full folder name like IDEA-XXXX-some-slug.`);
        }
        const entries = await fs.readdir(ideasDirAbs, { withFileTypes: true });
        const matches = entries
            .filter((e) => e.isDirectory() && e.name.startsWith(ref + '-'))
            .map((e) => e.name);
        if (matches.length === 0) {
            throw new Error(`No idea folder found starting with "${ref}-" under docs/forge/ideas/.`);
        }
        if (matches.length > 1) {
            throw new Error(`Multiple idea folders match "${ref}-":\n- ${matches.join('\n- ')}\nUse the full folder name.`);
        }
        return {
            content: [{ type: 'text', text: `Resolved: ${matches[0]}` }],
            structuredContent: { idea_id: matches[0] },
        };
    });
}
