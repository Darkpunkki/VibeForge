import * as path from 'node:path';
import * as fs from 'node:fs/promises';
export const FORGE_ROOT_REL = path.join('docs', 'forge');
export const IDEAS_REL = path.join(FORGE_ROOT_REL, 'ideas');
/**
 * Resolve an idea workspace by ID, and create required dirs/files if missing.
 * This is intentionally opinionated around docs/forge/ideas/<IDEA_ID>/...
 */
export async function ensureIdeaWorkspace(repoRootAbs, ideaId) {
    if (!ideaId || ideaId.includes(' ') || ideaId.includes('..') || ideaId.includes('/') || ideaId.includes('\\')) {
        throw new Error(`Invalid ideaId: "${ideaId}". Must be a single folder name.`);
    }
    const rootAbs = path.join(repoRootAbs, IDEAS_REL, ideaId);
    const inputsAbs = path.join(rootAbs, 'inputs');
    const latestAbs = path.join(rootAbs, 'latest');
    const runsAbs = path.join(rootAbs, 'runs');
    const manifestAbs = path.join(rootAbs, 'manifest.md');
    const runLogAbs = path.join(rootAbs, 'run_log.md');
    await fs.mkdir(inputsAbs, { recursive: true });
    await fs.mkdir(latestAbs, { recursive: true });
    await fs.mkdir(runsAbs, { recursive: true });
    // Create manifest/log if missing
    await ensureFile(manifestAbs, `# Manifest — ${ideaId}\n\n## Idea\n\n- idea_normalized_status: Draft\n- last_updated: \n- last_run_id: \n- latest_outputs:\n  - latest/idea_normalized.md\n- notes:\n  - \n`);
    await ensureFile(runLogAbs, `# Run Log — ${ideaId}\n\n`);
    return { ideaId, rootAbs, inputsAbs, latestAbs, runsAbs, manifestAbs, runLogAbs };
}
async function ensureFile(fileAbs, initial) {
    try {
        await fs.access(fileAbs);
    }
    catch {
        await fs.writeFile(fileAbs, initial, 'utf8');
    }
}
