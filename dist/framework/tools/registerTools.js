import { registerEnsureIdeaWorkspace } from './vfEnsureIdeaWorkspace.js';
import { registerCreateIdeaFromText } from './vfCreateIdeaFromText.js';
import { registerStartRun } from './vfStartRun.js';
import { registerReadWrite } from './vfReadWrite.js';
import { registerAppendLog } from './vfAppendLog.js';
import { registerResolveIdeaId } from './vfResolveIdeaId.js';
export function registerVfTools(server) {
    registerEnsureIdeaWorkspace(server);
    registerCreateIdeaFromText(server);
    registerStartRun(server);
    registerReadWrite(server);
    registerAppendLog(server);
    registerResolveIdeaId(server);
}
