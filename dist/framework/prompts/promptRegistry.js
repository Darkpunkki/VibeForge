import * as z from 'zod';
export function makePromptRegistry(files) {
    const prompts = new Map();
    for (const f of files) {
        const schema = compileInputSchema(f.inputSchema ?? {});
        prompts.set(f.name, {
            name: f.name,
            title: f.title,
            description: f.description,
            inputSchema: schema,
            template: f.template,
        });
    }
    return {
        list() {
            return [...prompts.values()];
        },
        async render(name, args) {
            const p = prompts.get(name);
            if (!p)
                throw new Error(`Prompt not found: ${name}`);
            // Validate args if schema provided
            const schema = z.object(p.inputSchema ?? {}).passthrough();
            const parsed = schema.parse(args ?? {});
            const text = substitute(p.template, parsed);
            return [
                {
                    role: 'user',
                    content: { type: 'text', text },
                },
            ];
        },
    };
}
/**
 * Compile a tiny schema mapping like:
 * inputs:
 *   idea_id: string
 *   mode: string
 *
 * into Zod schemas.
 */
function compileInputSchema(inputs) {
    const out = {};
    for (const [k, v] of Object.entries(inputs)) {
        const t = String(v).trim().toLowerCase();
        if (t === 'string')
            out[k] = z.string().describe(k);
        else if (t === 'number')
            out[k] = z.number().describe(k);
        else if (t === 'boolean')
            out[k] = z.boolean().describe(k);
        else
            out[k] = z.string().describe(k); // default
    }
    return out;
}
/** {{key}} substitution */
/** Template substitution:
 * - {{key}} -> args[key]
 * - $ARGUMENTS -> args.arguments (if provided)
 */
function substitute(template, args) {
    let out = template;
    if (typeof args.arguments === 'string') {
        out = out.replace(/\$ARGUMENTS\b/g, args.arguments);
    }
    return out.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_, key) => {
        const val = args[key];
        return val === undefined || val === null ? '' : String(val);
    });
}
