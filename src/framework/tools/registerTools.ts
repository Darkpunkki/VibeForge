import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerEnsureIdeaWorkspace } from './vfEnsureIdeaWorkspace.js';
import { registerCreateIdeaFromText } from './vfCreateIdeaFromText.js';
import { registerStartRun } from './vfStartRun.js';
import { registerReadWrite } from './vfReadWrite.js';
import { registerAppendLog } from './vfAppendLog.js';

export function registerVfTools(server: McpServer) {
  registerEnsureIdeaWorkspace(server);
  registerCreateIdeaFromText(server);
  registerStartRun(server);
  registerReadWrite(server);
  registerAppendLog(server);
}
