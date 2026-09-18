const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf8');

const replacement = `// Team KPIs
  const baseProjects = useMemo(() => {
    if (workspaceMode === 'team') return teamProjects;
    return teamProjects.filter((p) => Array.isArray(p.assignedMembers) && p.assignedMembers.some(m => m.toLowerCase() === (session?.user?.assignedName || 'Alireja').toLowerCase()));
  }, [teamProjects, workspaceMode, session?.user?.assignedName]);

  const teamFinancialOverview`;

content = content.replace('// Team KPIs\n  const teamFinancialOverview', replacement);

const kpiVariables = [
    'teamFinancialOverview',
    'teamCurrentMonthCount',
    'teamCurrentMonthOnlyCount',
    'teamRunningCount',
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

// Sidebar Titles
content = content.replace(
    /<div className="sidebar-section-title">Team Views<\/div>/g,
    '<div className="sidebar-section-title">{workspaceMode === "team" ? "TEAM VIEWS" : "YOUR ORDER VIEWS"}</div>'
);

content = content.replace(
    /<span>All Team Orders<\/span>/g,
    '<span>{workspaceMode === "team" ? "All Team Orders" : "Your All Orders"}</span>'
);

// Assigned Members Section wrapping
const startRegex = /\{\/\* Team Members Filter Section \*\/\}[\s\S]*?<div className="sidebar-section">[\s\S]*?<span>Assigned Members<\/span>/;
const matchStart = content.match(startRegex);
if (matchStart) {
    const wrappedStart = matchStart[0].replace(
        '<div className="sidebar-section">',
        '{workspaceMode === "team" && (\n                <div className="sidebar-section">'
    );
    content = content.replace(matchStart[0], wrappedStart);
    
    // Now close it
    const endRegex = /<span className="sidebar-count-badge">\{teamMemberCounts\[m\] \|\| 0\}<\/span>\s*<\/button>\s*\)\)\}\s*<\/div>/;
    const matchEnd = content.match(endRegex);
    if (matchEnd) {
        content = content.replace(matchEnd[0], matchEnd[0] + '\n                )}');
    }
}

fs.writeFileSync('app/page.js', content, 'utf8');
