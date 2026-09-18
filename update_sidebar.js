const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf8');

// 1. Add baseProjects logic for Sidebar Stats
const teamKpisIndex = content.indexOf('// Team KPIs\n  const teamFinancialOverview');
if (teamKpisIndex !== -1) {
    const replacement = `// Team KPIs
  const baseProjects = useMemo(() => {
    if (workspaceMode === 'team') return teamProjects;
    return teamProjects.filter((p) => Array.isArray(p.assignedMembers) && p.assignedMembers.some(m => m.toLowerCase() === (session?.user?.assignedName || 'Alireja').toLowerCase()));
  }, [teamProjects, workspaceMode, session?.user?.assignedName]);

  const teamFinancialOverview`;
    
    // Replace the exact string
    content = content.replace('// Team KPIs\n  const teamFinancialOverview', replacement);
    
    // Now replace 'teamProjects' with 'baseProjects' inside the KPI calculation blocks!
    // We only want to replace it for teamFinancialOverview, teamCurrentMonthCount, teamCurrentWipCount, teamCurrentDeliveredCount, teamCurrentCancelCount, teamCurrentNeedReqCount, teamCurrentNRACount, teamCarryCount.
    
    const kpiVariables = [
        'teamFinancialOverview',
        'teamCurrentMonthCount',
        'teamCurrentWipCount',
        'teamCurrentDeliveredCount',
        'teamCurrentCancelCount',
        'teamCurrentNeedReqCount',
        'teamCurrentNRACount',
        'teamCarryCount'
    ];
    
    kpiVariables.forEach(varName => {
        const regex = new RegExp(`const ${varName} = useMemo\\(\\(\\) => \\{[\\s\\S]*?\\}, \\[(.*?)\\]\\);`);
        const match = content.match(regex);
        if (match) {
            let block = match[0].replace(/teamProjects/g, 'baseProjects');
            content = content.replace(match[0], block);
        }
    });
}

// 2. Change "TEAM VIEWS" text dynamically
content = content.replace(
    '<div className="sidebar-section-title">Team Views</div>',
    '<div className="sidebar-section-title">{isTeamMode ? "TEAM VIEWS" : "YOUR ORDER VIEWS"}</div>'
);

// 3. Change "All Team Orders" text dynamically
content = content.replace(
    /<span>All Team Orders<\/span>/g,
    '<span>{isTeamMode ? "All Team Orders" : "Your All Orders"}</span>'
);

// 4. Hide "Assigned Members" in the sidebar when in Personal mode
const assignedMembersSectionStr = `<div className="sidebar-section">
                  <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Assigned Members</span>`;

content = content.replace(
    assignedMembersSectionStr,
    `{isTeamMode && (
                <div className="sidebar-section">
                  <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Assigned Members</span>`
);

// Now we need to close the wrapping brace for Assigned Members
// Let's find the closing tag for the Assigned Members section
// The section ends right before `</div>` and `</nav>` of the sidebar.
// We can use a regex to find the end of this block.
const assignedMemberEndRegex = /(<span className="sidebar-count-badge">\{teamMemberCounts\[m\] \|\| 0\}<\/span>\s*<\/button>\s*\)\)\}\s*<\/div>)/;
const matchEnd = content.match(assignedMemberEndRegex);
if (matchEnd) {
    content = content.replace(matchEnd[0], matchEnd[0] + '\n              )}');
}

fs.writeFileSync('app/page.js', content, 'utf8');
console.log("update_sidebar.js executed!");
