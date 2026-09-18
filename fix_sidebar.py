import re

with open('app/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add baseProjects
replacement = """// Team KPIs
  const baseProjects = useMemo(() => {
    if (workspaceMode === 'team') return teamProjects;
    return teamProjects.filter((p) => Array.isArray(p.assignedMembers) && p.assignedMembers.some(m => m.toLowerCase() === (session?.user?.assignedName || 'Alireja').toLowerCase()));
  }, [teamProjects, workspaceMode, session?.user?.assignedName]);

  const teamFinancialOverview"""

content = re.sub(r'// Team KPIs\s+const teamFinancialOverview', replacement, content, count=1)

# 2. Replace teamProjects with baseProjects in KPI blocks
kpi_variables = [
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
]

for var_name in kpi_variables:
    pattern = r'(const ' + var_name + r' = useMemo\(\(\) => \{.*?\},\s*\[)(.*?)(\]\);)'
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        block = match.group(0).replace('teamProjects', 'baseProjects')
        content = content.replace(match.group(0), block)

# 3. Titles
content = content.replace(
    '<div className="sidebar-section-title">Team Views</div>',
    '<div className="sidebar-section-title">{workspaceMode === "team" ? "TEAM VIEWS" : "YOUR ORDER VIEWS"}</div>'
)

content = content.replace(
    '<span>All Team Orders</span>',
    '<span>{workspaceMode === "team" ? "All Team Orders" : "Your All Orders"}</span>'
)

# 4. Assigned Members
start_pattern = r'\{\/\*\s*Team Members Filter Section\s*\*\/\}\s*<div className="sidebar-section">'
match_start = re.search(start_pattern, content)
if match_start:
    wrapped_start = match_start.group(0).replace(
        '<div className="sidebar-section">',
        '{workspaceMode === "team" && (\n                <div className="sidebar-section">'
    )
    content = content.replace(match_start.group(0), wrapped_start)

end_pattern = r'<span className="sidebar-count-badge">\{teamMemberCounts\[m\] \|\| 0\}</span>\s*</button>\s*\)\)\}\s*</div>'
match_end = re.search(end_pattern, content)
if match_end:
    content = content.replace(match_end.group(0), match_end.group(0) + '\n                )}')

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
