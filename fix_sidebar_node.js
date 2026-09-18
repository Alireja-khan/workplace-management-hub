const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// 1. Add baseProjects
const replacement = `// Team KPIs
  const baseProjects = useMemo(() => {
    if (workspaceMode === 'team') return teamProjects;
    return teamProjects.filter((p) => Array.isArray(p.assignedMembers) && p.assignedMembers.some(m => m.toLowerCase() === (session?.user?.assignedName || 'Alireja').toLowerCase()));
  }, [teamProjects, workspaceMode, session?.user?.assignedName]);

  const teamFinancialOverview`;

content = content.replace(/\/\/ Team KPIs\r?\n\s*const teamFinancialOverview/, replacement);

// 2. Replace teamProjects with baseProjects in KPI blocks
const kpi_variables = [
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

kpi_variables.forEach(var_name => {
    const pattern = new RegExp(`(const ${var_name} = useMemo\\(\\(\\) => \\{[\\s\\S]*?\\},\\s*\\[)([\\s\\S]*?)(\\]\\);)`);
    const match = content.match(pattern);
    if (match) {
        let block = match[0].replace(/teamProjects/g, 'baseProjects');
        content = content.replace(match[0], block);
    }
});

// 3. Titles
content = content.replace(
    '<div className="sidebar-section-title">Team Views</div>',
    '<div className="sidebar-section-title">{workspaceMode === "team" ? "TEAM VIEWS" : "YOUR ORDER VIEWS"}</div>'
);

content = content.replace(
    /<span>All Team Orders<\/span>/g,
    '<span>{workspaceMode === "team" ? "All Team Orders" : "Your All Orders"}</span>'
);

// 4. Assigned Members
const start_pattern = /\{\/\*\s*Team Members Filter Section\s*\*\/\}\r?\n\s*<div className="sidebar-section">/;
const match_start = content.match(start_pattern);
if (match_start) {
    const wrapped_start = match_start[0].replace(
        '<div className="sidebar-section">',
        '{workspaceMode === "team" && (\n                <div className="sidebar-section">'
    );
    content = content.replace(match_start[0], wrapped_start);
}

const end_pattern = /<span className="sidebar-count-badge">\{teamMemberCounts\[m\] \|\| 0\}<\/span>\s*<\/button>\s*\)\)\}\s*<\/div>/;
const match_end = content.match(end_pattern);
if (match_end) {
    content = content.replace(match_end[0], match_end[0] + '\n                )}');
}

fs.writeFileSync('app/page.js', content, 'utf8');
