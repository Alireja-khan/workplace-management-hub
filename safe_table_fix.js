const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// 1. Fix Select All toggle
content = content.replace(
    /setSelectedTeamOrders\(filteredTeamProjects\.map\(p => p\._id\)\);/g,
    "setSelectedTeamOrders(currentProjects.map(p => p._id));"
);

// 2. Fix the Table Pill
content = content.replace(
    /\? \`\$\{currentTab === 'all' \? 'All Team Orders' : currentTab === 'running' \? 'Running Team Orders' : `\$\{currentTab\} Orders`\}: \$\{filteredTeamProjects\.length\} Records`/g,
    "? `${currentTab === 'all' ? 'All Team Orders' : currentTab === 'running' ? 'Running Team Orders' : `${currentTab} Orders`}: ${currentProjects.length} Records`"
);

content = content.replace(
    /: \`\$\{currentTab === 'all' \? 'All Orders' : currentTab === 'running' \? 'Running Orders' : `\$\{currentTab\} Orders`\}: \$\{filteredProjects\.length\} Records`/g,
    ": `${currentTab === 'all' ? 'All Orders' : currentTab === 'running' ? 'Running Orders' : `${currentTab} Orders`}: ${currentProjects.length} Records`"
);

// 3. Fix the Checkbox Select All
content = content.replace(
    /checked=\{filteredTeamProjects\.length > 0 && selectedTeamOrders\.length === filteredTeamProjects\.length\}/g,
    "checked={currentProjects.length > 0 && selectedTeamOrders.length === currentProjects.length}"
);

// 4. Fix the tbody table rows logic
// Replace only the occurrences within the `{true ? ( /* TEAM TABLE ROWS */ ... ) : ( ... )}` block.
// Let's just find `filteredTeamProjects.length === 0` and `filteredTeamProjects.map((p) => {`
// and replace them with `currentProjects.length === 0` and `currentProjects.map((p) => {`
content = content.replace(
    /filteredTeamProjects\.length === 0 \? \(/g,
    "currentProjects.length === 0 ? ("
);

content = content.replace(
    /filteredTeamProjects\.map\(\(p\) => \{/g,
    "currentProjects.map((p) => {"
);

// 5. Fix the Kanban board
content = content.replace(
    /const colItems = filteredTeamProjects\.filter\(/g,
    "const colItems = currentProjects.filter("
);

fs.writeFileSync('app/page.js', content, 'utf8');
