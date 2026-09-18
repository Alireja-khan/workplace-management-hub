const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// The `currentProjects` variable is already correctly choosing between filteredTeamProjects and filteredPersonalProjects:
// const currentProjects = isTeamMode ? filteredTeamProjects : filteredPersonalProjects;

// 1. Fix the table pill
content = content.replace(
    /\{workspaceMode === 'team'[\s\S]*?filteredProjects\.length\} Records`\}/,
    "`${workspaceMode === 'team' ? (currentTab === 'all' ? 'All Team Orders' : currentTab === 'running' ? 'Running Team Orders' : currentTab + ' Orders') : (currentTab === 'all' ? 'All Orders' : currentTab === 'running' ? 'Running Orders' : currentTab + ' Orders')}: ${currentProjects.length} Records`"
);

// 2. Fix Select All checkbox and toggle
content = content.replace(
    /checked=\{filteredTeamProjects\.length > 0 && selectedTeamOrders\.length === filteredTeamProjects\.length\}/,
    "checked={currentProjects.length > 0 && selectedTeamOrders.length === currentProjects.length}"
);

content = content.replace(
    /setSelectedTeamOrders\(filteredTeamProjects\.map\(p => p\._id\)\);/,
    "setSelectedTeamOrders(currentProjects.map(p => p._id));"
);

// 3. Fix the entire Table rendering block.
// The current code is:
// {true ? ( /* TEAM TABLE ROWS */ filteredTeamProjects.length === 0 ? ... : filteredTeamProjects.map(...) ) : ( ... )}
// Let's replace `filteredTeamProjects` with `currentProjects` inside the `true ?` block, 
// and then we can safely change `{true ?` to `{true ?` so it just keeps using the first block but with currentProjects.
// Actually, let's just replace all instances of `filteredTeamProjects` with `currentProjects` between `<tbody>` and `</tbody>`

const tbodyMatch = content.match(/<tbody>[\s\S]*?<\/tbody>/);
if (tbodyMatch) {
    let tbodyContent = tbodyMatch[0];
    
    // We only want the first block of the ternary `{true ? (...) : (...)}`
    // Wait, simpler: replace all `filteredTeamProjects` inside the tbody with `currentProjects`.
    tbodyContent = tbodyContent.replace(/filteredTeamProjects\.length/g, 'currentProjects.length');
    tbodyContent = tbodyContent.replace(/filteredTeamProjects\.map/g, 'currentProjects.map');
    
    content = content.replace(tbodyMatch[0], tbodyContent);
}

// 4. Fix the Kanban board
const kanbanMatch = content.match(/<div className="v-kanban-board">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
if (kanbanMatch) {
    let kanbanContent = kanbanMatch[0];
    // Replace the ternary with just mapping currentProjects
    kanbanContent = kanbanContent.replace(
        /\{workspaceMode === 'team'[\s\S]*?\['Assigned', 'Wip', 'Issue', 'Delivered', 'Done'\]\.map\(\(colStatus\) => \{/g,
        `{['Wip', 'Delivered', 'Done', 'NRA', 'Need Requirements', 'Cancel'].map((colStatus) => {`
    );
    kanbanContent = kanbanContent.replace(/filteredTeamProjects\.filter/g, 'currentProjects.filter');
    kanbanContent = kanbanContent.replace(/filteredProjects\.filter/g, 'currentProjects.filter');
    content = content.replace(kanbanMatch[0], kanbanContent);
}

// Write the changes
fs.writeFileSync('app/page.js', content, 'utf8');
