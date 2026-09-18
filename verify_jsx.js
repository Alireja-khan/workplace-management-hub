const fs = require('fs');
const content = fs.readFileSync('app/page.js', 'utf-8');

const tStart = content.indexOf("{workspaceMode === 'personal' ? (");
const mid = content.indexOf(") : (", tStart);
const tEnd = content.indexOf("{/* Bulk Action Bar for Team Workspace */}");

console.log('tStart:', tStart);
console.log('mid:', mid);
console.log('tEnd:', tEnd);

const afterMid = content.slice(mid + 5, tEnd);
console.log('End of team block (last 20 chars):', afterMid.slice(-20).replace(/\n/g, '\\n'));
