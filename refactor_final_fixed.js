const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf-8');

// 1. Remove old personal states
content = content.replace(/const \[projects, setProjects\] = useState\(\[\]\);\s*/, '');
content = content.replace(/const \[currentTab, setCurrentTab\] = useState\('running'\);\s*/, '');
content = content.replace(/const \[currentView, setCurrentView\] = useState\('table'\);\s*/, '');
content = content.replace(/const \[searchQuery, setSearchQuery\] = useState\(''\);\s*/, '');
content = content.replace(/const \[profileFilter, setProfileFilter\] = useState\('all'\);\s*/, '');
content = content.replace(/const \[statusFilter, setStatusFilter\] = useState\('all'\);\s*/, '');
content = content.replace(/const \[currentStatusFilter, setCurrentStatusFilter\] = useState\('all'\);\s*/, '');
content = content.replace(/const \[scheduleFilter, setScheduleFilter\] = useState\('all'\);\s*/, '');
content = content.replace(/const \[sortConfig, setSortConfig\] = useState\(\{.*?\}\);\s*/s, '');
content = content.replace(/const \[isModalOpen, setIsModalOpen\] = useState\(false\);\s*/, '');
content = content.replace(/const \[activeProject, setActiveProject\] = useState\(null\);\s*/, '');
content = content.replace(/const \[savingStatusId, setSavingStatusId\] = useState\(null\);\s*/, '');
content = content.replace(/const \[savedStatusSuccessId, setSavedStatusSuccessId\] = useState\(null\);\s*/, '');
content = content.replace(/const \[savingCStatusId, setSavingCStatusId\] = useState\(null\);\s*/, '');
content = content.replace(/const \[savedCStatusSuccessId, setSavedCStatusSuccessId\] = useState\(null\);\s*/, '');
content = content.replace(/const \[isSubmitting, setIsSubmitting\] = useState\(false\);\s*/, '');

// 2. Add new personal states right above team states
const personal_states = `  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [personalStatusFilter, setPersonalStatusFilter] = useState('All Statuses');
  const [personalSalesFilter, setPersonalSalesFilter] = useState('All Sales');
  const [personalProfileFilter, setPersonalProfileFilter] = useState('All Profiles');
  const [personalMonthFilter, setPersonalMonthFilter] = useState(MONTH_LIST[new Date().getMonth()]);
  const [personalYearFilter, setPersonalYearFilter] = useState(new Date().getFullYear().toString());
  const [personalDateFilterType, setPersonalDateFilterType] = useState('Assign Date');
`;
content = content.replace("const [teamProjects, setTeamProjects] = useState([]);", personal_states + "\n  const [teamProjects, setTeamProjects] = useState([]);");

// 3. Remove fetchProjects
content = content.replace(/const fetchProjects = async \(\) => \{[\s\S]*?\};\s*/, '');
content = content.replace(/await fetchProjects\(\);\n/g, '');
content = content.replace(/fetchProjects\(\);\n/g, '');
content = content.replace(/fetchProjects,\n/g, '');
content = content.replace(/fetchProjects\(\);/g, '');
content = content.replace(/await fetchProjects\(\);/g, '');

// 4. Create filteredPersonalProjects
const teamRegex = /(const filteredTeamProjects = useMemo\(\(\) => \{[\s\S]*?\}\), \[.*?\]\);)/;
const match = content.match(teamRegex);
if (match) {
    const team_block = match[1];
    let personal_block = team_block.replace(/filteredTeamProjects/g, "filteredPersonalProjects");
    personal_block = personal_block.replace(/teamSearchQuery/g, "personalSearchQuery");
    personal_block = personal_block.replace(/teamStatusFilter/g, "personalStatusFilter");
    
    personal_block = personal_block.replace("if (!memberMatch)", "const isMyProject = isMemberMatch(p.assignedMembers, session?.user?.assignedName || 'Alireja');\n        if (!isMyProject) return false;\n\n        if (!memberMatch)");
    personal_block = personal_block.replace(/teamMemberFilter/g, "'All Members'");
    personal_block = personal_block.replace(/teamSalesFilter/g, "personalSalesFilter");
    personal_block = personal_block.replace(/teamProfileFilter/g, "personalProfileFilter");
    personal_block = personal_block.replace(/teamMonthFilter/g, "personalMonthFilter");
    personal_block = personal_block.replace(/teamYearFilter/g, "personalYearFilter");
    personal_block = personal_block.replace(/teamDateFilterType/g, "personalDateFilterType");
    
    const dep_array_match = personal_block.match(/, \[(.*?)\]\);/);
    if (dep_array_match) {
        let new_dep_array = dep_array_match[1].replace(/teamSearchQuery/g, "personalSearchQuery")
          .replace(/teamStatusFilter/g, "personalStatusFilter")
          .replace(/teamSalesFilter/g, "personalSalesFilter")
          .replace(/teamProfileFilter/g, "personalProfileFilter")
          .replace(/teamMonthFilter/g, "personalMonthFilter")
          .replace(/teamYearFilter/g, "personalYearFilter")
          .replace(/teamDateFilterType/g, "personalDateFilterType")
          .replace(/teamMemberFilter, /g, "");
        new_dep_array += ", session?.user?.assignedName";
        personal_block = personal_block.replace(/, \[.*?\]\);/, `, [${new_dep_array}]);`);
    }
    
    content = content.replace(team_block, team_block + "\n\n  " + personal_block);
}

// 5. Add dynamic variable definitions
const dynamicVars = `
  const isTeamMode = workspaceMode === 'team';
  const currentProjects = isTeamMode ? filteredTeamProjects : filteredPersonalProjects;
  const currentSearchQuery = isTeamMode ? teamSearchQuery : personalSearchQuery;
  const setCurrentSearchQuery = isTeamMode ? setTeamSearchQuery : setPersonalSearchQuery;
  const currentDateFilterType = isTeamMode ? teamDateFilterType : personalDateFilterType;
  const setCurrentDateFilterType = isTeamMode ? setTeamDateFilterType : setPersonalDateFilterType;
  const currentYearFilter = isTeamMode ? teamYearFilter : personalYearFilter;
  const setCurrentYearFilter = isTeamMode ? setTeamYearFilter : setPersonalYearFilter;
  const currentMonthFilter = isTeamMode ? teamMonthFilter : personalMonthFilter;
  const setCurrentMonthFilter = isTeamMode ? setTeamMonthFilter : setPersonalMonthFilter;
  const currentSalesFilter = isTeamMode ? teamSalesFilter : personalSalesFilter;
  const setCurrentSalesFilter = isTeamMode ? setTeamSalesFilter : setPersonalSalesFilter;
  const currentProfileFilter = isTeamMode ? teamProfileFilter : personalProfileFilter;
  const setCurrentProfileFilter = isTeamMode ? setTeamProfileFilter : setPersonalProfileFilter;
  const currentStatusFilter = isTeamMode ? teamStatusFilter : personalStatusFilter;
  const setCurrentStatusFilter = isTeamMode ? setTeamStatusFilter : setPersonalStatusFilter;
  const currentMemberFilter = isTeamMode ? teamMemberFilter : 'All Members';
  const setCurrentMemberFilter = isTeamMode ? setTeamMemberFilter : () => {};
`;
content = content.replace(/(const filteredPersonalProjects = useMemo[\s\S]*?\]\);)/, "$1\n" + dynamicVars);

// 6. Delete the entire personal workspace JSX and make Team workspace handle both
const mainStart = content.indexOf('<main className="main-content">');
const tStart = content.indexOf("{workspaceMode === 'personal' ? (", mainStart);
const mid = content.indexOf(") : (", tStart);
const tEnd = content.indexOf("{/* Bulk Action Bar for Team Workspace */}");

if (tStart > -1 && mid > -1 && tEnd > -1) {
    let teamBlock = content.slice(mid + 5, tEnd);
    // REMOVE THE LAST )} WHICH WAS CLOSING THE TERNARY!
    teamBlock = teamBlock.replace(/\)\}\s*$/, '');
    content = content.slice(0, tStart) + teamBlock + '\n        ' + content.slice(tEnd);
    console.log("JSX block replaced successfully.");
}

// 7. Inside the now-unified render part, replace references to \`filteredTeamProjects\` with \`currentProjects\`, etc.
const returnIdx = content.indexOf('<main className="main-content">');
let beforeReturn = content.slice(0, returnIdx);
let afterReturn = content.slice(returnIdx);

afterReturn = afterReturn.replace(/filteredTeamProjects/g, "currentProjects");
afterReturn = afterReturn.replace(/teamSearchQuery/g, "currentSearchQuery");
afterReturn = afterReturn.replace(/setTeamSearchQuery/g, "setCurrentSearchQuery");
afterReturn = afterReturn.replace(/teamDateFilterType/g, "currentDateFilterType");
afterReturn = afterReturn.replace(/setTeamDateFilterType/g, "setCurrentDateFilterType");
afterReturn = afterReturn.replace(/teamYearFilter/g, "currentYearFilter");
afterReturn = afterReturn.replace(/setTeamYearFilter/g, "setCurrentYearFilter");
afterReturn = afterReturn.replace(/teamMonthFilter/g, "currentMonthFilter");
afterReturn = afterReturn.replace(/setTeamMonthFilter/g, "setCurrentMonthFilter");
afterReturn = afterReturn.replace(/teamSalesFilter/g, "currentSalesFilter");
afterReturn = afterReturn.replace(/setTeamSalesFilter/g, "setCurrentSalesFilter");
afterReturn = afterReturn.replace(/teamProfileFilter/g, "currentProfileFilter");
afterReturn = afterReturn.replace(/setTeamProfileFilter/g, "setCurrentProfileFilter");
afterReturn = afterReturn.replace(/teamStatusFilter/g, "currentStatusFilter");
afterReturn = afterReturn.replace(/setTeamStatusFilter/g, "setCurrentStatusFilter");
afterReturn = afterReturn.replace(/teamMemberFilter/g, "currentMemberFilter");
afterReturn = afterReturn.replace(/setTeamMemberFilter/g, "setCurrentMemberFilter");
// Conditionally disable the teamMemberFilter dropdown in Personal Mode.
afterReturn = afterReturn.replace(/<select\s+className="filter-select"\s+value=\{currentMemberFilter\}/g, `<select
                    className="filter-select"
                    value={currentMemberFilter}
                    disabled={!isTeamMode}`);

content = beforeReturn + afterReturn;

// 8. Fix stats block (ensure this runs on the whole file or before the return split if it's outside return)
content = content.replace(/const uniqueYears = \[...new Set\(teamProjects\.map/g, "const uniqueYears = [...new Set(teamProjects.map"); 
content = content.replace(/const totalTeamGross = filteredTeamProjects/g, "const totalTeamGross = currentProjects");
content = content.replace(/const totalTeamNet = filteredTeamProjects/g, "const totalTeamNet = currentProjects");

// 9. Remove unused old functions: saveStatus, saveCurrentStatus, exportCSV
content = content.replace(/const saveStatus = async[\s\S]*?\};\s*(?=const saveCurrentStatus)/, '');
content = content.replace(/const saveCurrentStatus = async[\s\S]*?\};\s*(?=const deleteProject)/, '');
content = content.replace(/const exportCSV = \(\) => \{[\s\S]*?\};\s*(?=const openNewModal)/, '');
content = content.replace(/const openNewModal = \(\) => \{[\s\S]*?\};\s*(?=const closeNewModal)/, '');
content = content.replace(/const closeNewModal = \(\) => \{[\s\S]*?\};\s*(?=const handleInputChange)/, '');
content = content.replace(/const handleInputChange = \(e\) => \{[\s\S]*?\};\s*(?=const handleUpdateField)/, '');
content = content.replace(/const handleUpdateField = async[\s\S]*?\};\s*(?=const handleSubmit)/, '');
content = content.replace(/const handleSubmit = async[\s\S]*?\};\s*(?=const confirmDelete)/, '');
content = content.replace(/const confirmDelete = \(id\) => \{[\s\S]*?\};\s*(?=const deleteProject)/, '');
content = content.replace(/const deleteProject = async[\s\S]*?\};\s*(?=const handleOpenDetail)/, '');
content = content.replace(/const handleOpenDetail = \(project\) => \{[\s\S]*?\};\s*(?=const handleCloseDetail)/, '');
content = content.replace(/const handleCloseDetail = \(\) => \{[\s\S]*?\};\s*(?=const toggleDescription)/, '');
content = content.replace(/const toggleDescription = \(id\) => \{[\s\S]*?\};\s*(?=const handleAuth)/, '');

fs.writeFileSync('app/page.js', content, 'utf-8');
