const fs = require('fs');
const content = fs.readFileSync('app/page.js', 'utf-8');
const pStart = content.indexOf("{workspaceMode === 'personal' ? (");
const pEnd = content.indexOf("        {/* Bulk Action Bar for Team Workspace */}");
console.log(pStart, pEnd);

if (pStart > -1 && pEnd > -1) {
    const jsxBlock = content.slice(pStart, pEnd);
    const midIdx = jsxBlock.indexOf("        ) : (");
    if (midIdx > -1) {
        const teamBlock = jsxBlock.slice(midIdx + 13, -10); // get the contents of the team block
        // replace the entire thing with just the team block
        const newContent = content.slice(0, pStart) + teamBlock + content.slice(pEnd);
        fs.writeFileSync('app/page.js', newContent, 'utf-8');
        console.log("JSX block replaced successfully.");
    }
}
