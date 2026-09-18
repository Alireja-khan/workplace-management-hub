import re

with open('app/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove projects state and other useless states
content = re.sub(r"const \[projects, setProjects\] = useState\(\[\]\);.*?const \[currentTab, setCurrentTab\] = useState\('running'\);\s*", "", content, flags=re.DOTALL)
content = re.sub(r"const \[profileFilter, setProfileFilter\].*?const \[sortConfig, setSortConfig\].*?\} \);\s*", "", content, flags=re.DOTALL)

# Add personal filter states
personal_states = """  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [personalStatusFilter, setPersonalStatusFilter] = useState('All Statuses');
  const [personalSalesFilter, setPersonalSalesFilter] = useState('All Sales');
  const [personalProfileFilter, setPersonalProfileFilter] = useState('All Profiles');
  const [personalMonthFilter, setPersonalMonthFilter] = useState(MONTH_LIST[new Date().getMonth()]);
  const [personalYearFilter, setPersonalYearFilter] = useState(new Date().getFullYear().toString());
  const [personalDateFilterType, setPersonalDateFilterType] = useState('Assign Date');
"""
content = content.replace("const [teamProjects, setTeamProjects] = useState([]);", personal_states + "\n  const [teamProjects, setTeamProjects] = useState([]);")

# 2. Modify fetchProjects to fetch team projects if not already fetched? Or just fetch teamProjects once.
content = re.sub(r"const fetchProjects = async \(\) => \{.*?\};\s*", "", content, flags=re.DOTALL)
content = content.replace("await fetchProjects();\n", "")
content = content.replace("fetchProjects();\n", "")
content = content.replace("fetchProjects,\n", "")
content = content.replace("fetchProjects();", "")
content = content.replace("await fetchProjects();", "")

# 3. Create filteredPersonalProjects
filtered_team_regex = r"(const filteredTeamProjects = useMemo\(\(\) => \{.*?\}\), \[.*?\]\);)"
match = re.search(filtered_team_regex, content, re.DOTALL)
if match:
    team_block = match.group(1)
    personal_block = team_block.replace("filteredTeamProjects", "filteredPersonalProjects")
    personal_block = personal_block.replace("teamProjects", "teamProjects") # keep teamProjects base
    personal_block = personal_block.replace("teamSearchQuery", "personalSearchQuery")
    personal_block = personal_block.replace("teamStatusFilter", "personalStatusFilter")
    
    # Crucial: inject user check
    personal_block = personal_block.replace("if (!memberMatch)", "const isMyProject = isMemberMatch(p.assignedMembers, session?.user?.assignedName || 'Alireja');\n        if (!isMyProject) return false;\n\n        if (!memberMatch)")
    personal_block = personal_block.replace("teamMemberFilter", "'All Members'") # Hardcode since it's personal
    personal_block = personal_block.replace("teamSalesFilter", "personalSalesFilter")
    personal_block = personal_block.replace("teamProfileFilter", "personalProfileFilter")
    personal_block = personal_block.replace("teamMonthFilter", "personalMonthFilter")
    personal_block = personal_block.replace("teamYearFilter", "personalYearFilter")
    personal_block = personal_block.replace("teamDateFilterType", "personalDateFilterType")
    
    # Update dependency array
    # Replace dependency array logic inside personal_block
    dep_array = re.search(r", \[(.*?)\]\);", personal_block).group(1)
    new_dep_array = dep_array.replace("teamSearchQuery", "personalSearchQuery").replace("teamStatusFilter", "personalStatusFilter").replace("teamSalesFilter", "personalSalesFilter").replace("teamProfileFilter", "personalProfileFilter").replace("teamMonthFilter", "personalMonthFilter").replace("teamYearFilter", "personalYearFilter").replace("teamDateFilterType", "personalDateFilterType")
    new_dep_array = new_dep_array.replace("teamMemberFilter, ", "")
    new_dep_array = new_dep_array + ", session?.user?.assignedName"
    personal_block = re.sub(r", \[.*?\]\);", f", [{new_dep_array}]);", personal_block)
    
    # insert after team block
    content = content.replace(team_block, team_block + "\n\n  " + personal_block)

# 4. Now, the JSX UI part. I need to replace the entire <div className="workspace-container"> where workspaceMode === 'personal'
# Actually, I can just do this manually in my own code if the file size is too big, but let me try to do a chunk replacement.

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
