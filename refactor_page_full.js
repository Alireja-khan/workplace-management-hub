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

// Insert it right after filteredPersonalProjects (before stats calculations)
content = content.replace(/(const filteredPersonalProjects = useMemo[\s\S]*?\]\);)/, "$1\n" + dynamicVars);


// 6. Delete the entire personal workspace JSX and make Team workspace handle both
// The structure is roughly:
// {workspaceMode === 'personal' ? ( ...huge block... ) : ( ...team block... )}
// I will replace `{workspaceMode === 'personal' ? ( ... ) : ( ... )}` with just `( ...team block... )`
const jsxRegex = /\{workspaceMode === 'personal' \? \([\s\S]*?\) : \([\s\S]*?(<div style=\{\{ display: 'flex', flexDirection: 'column', height: '100%' \}\}>[\s\S]*?)\)\}/;
const matchJsx = content.match(jsxRegex);
if (matchJsx) {
    const teamJsx = matchJsx[1]; // This is the team block
    content = content.replace(jsxRegex, teamJsx);
} else {
    console.error('Could not match JSX block');
}

// 7. Inside the now-unified teamJsx block, I need to replace references to `filteredTeamProjects` with `currentProjects`, `teamSearchQuery` with `currentSearchQuery`, etc.
// But only within the JSX part! Let's do a global replace for the whole file? No, only in the render part.
// The render part is everything after `return (`
const returnIdx = content.indexOf('return (');
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

content = beforeReturn + afterReturn;

// 8. Fix a few logic things.
// In the team stats:
// const stats = ... uses `filteredTeamProjects`. Change to `currentProjects`.
content = content.replace(/const uniqueYears = \[...new Set\(teamProjects\.map/g, "const uniqueYears = [...new Set(teamProjects.map"); 
content = content.replace(/const totalTeamGross = filteredTeamProjects/g, "const totalTeamGross = currentProjects");
content = content.replace(/const totalTeamNet = filteredTeamProjects/g, "const totalTeamNet = currentProjects");

// 9. Remove unused old functions: saveStatus, saveCurrentStatus, exportCSV
content = content.replace(/const saveStatus = async[\s\S]*?\};\s*(?=const saveCurrentStatus)/, '');
content = content.replace(/const saveCurrentStatus = async[\s\S]*?\};\s*(?=const deleteProject)/, '');
content = content.replace(/const exportCSV = \(\) => \{[\s\S]*?\};\s*(?=const renderTeamWorkspace)/, ''); // wait, there is no renderTeamWorkspace!

fs.writeFileSync('app/page.js', content, 'utf-8');
