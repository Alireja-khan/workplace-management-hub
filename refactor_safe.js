const fs = require('fs');

let content = fs.readFileSync('app/page.js', 'utf-8');

const personal_states = `  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [personalStatusFilter, setPersonalStatusFilter] = useState('All Statuses');
  const [personalSalesFilter, setPersonalSalesFilter] = useState('All Sales');
  const [personalProfileFilter, setPersonalProfileFilter] = useState('All Profiles');
  const [personalMonthFilter, setPersonalMonthFilter] = useState(MONTH_LIST[new Date().getMonth()]);
  const [personalYearFilter, setPersonalYearFilter] = useState(new Date().getFullYear().toString());
  const [personalDateFilterType, setPersonalDateFilterType] = useState('Assign Date');
`;
content = content.replace("const [teamProjects, setTeamProjects] = useState([]);", personal_states + "\n  const [teamProjects, setTeamProjects] = useState([]);");

const teamRegex = /(const filteredTeamProjects = useMemo\(\(\) => \{[\s\S]*?\}, \[.*?\]\);)/;
const match = content.match(teamRegex);
if (match) {
    const team_block = match[1];
    let personal_block = team_block.replace(/filteredTeamProjects/g, "filteredPersonalProjects");
    personal_block = personal_block.replace(/searchQuery/g, "personalSearchQuery");
    personal_block = personal_block.replace(/statusFilter/g, "personalStatusFilter");
    
    // Add the specific personal filtering
    personal_block = personal_block.replace("if (!memberMatch)", "const isMyProject = Array.isArray(p.assignedMembers) && p.assignedMembers.some(m => m.toLowerCase() === (session?.user?.assignedName || 'Alireja').toLowerCase());\n        if (!isMyProject) return false;\n\n        if (!memberMatch)");
    
    personal_block = personal_block.replace(/teamMemberFilter/g, "'All Members'");
    personal_block = personal_block.replace(/teamSalesFilter/g, "personalSalesFilter");
    personal_block = personal_block.replace(/profileFilter/g, "personalProfileFilter");
    personal_block = personal_block.replace(/teamMonthFilter/g, "personalMonthFilter");
    personal_block = personal_block.replace(/teamYearFilter/g, "personalYearFilter");
    personal_block = personal_block.replace(/teamDateFilterType/g, "personalDateFilterType");
    
    // Update dependency array specifically
    const dep_array_match = personal_block.match(/, \[(.*?)\]\);/);
    if (dep_array_match) {
        let new_dep_array = dep_array_match[1].replace(/searchQuery/g, "personalSearchQuery")
          .replace(/statusFilter/g, "personalStatusFilter")
          .replace(/teamSalesFilter/g, "personalSalesFilter")
          .replace(/profileFilter/g, "personalProfileFilter")
          .replace(/teamMonthFilter/g, "personalMonthFilter")
          .replace(/teamYearFilter/g, "personalYearFilter")
          .replace(/teamDateFilterType/g, "personalDateFilterType")
          .replace(/teamMemberFilter, /g, "");
        new_dep_array += ", session?.user?.assignedName";
        personal_block = personal_block.replace(/, \[.*?\]\);/, `, [${new_dep_array}]);`);
    }
    
    content = content.replace(team_block, team_block + "\n\n  " + personal_block);
} else {
    console.log("Failed to match teamRegex!");
}

const dynamicVars = `
  const isTeamMode = workspaceMode === 'team';
  const currentProjects = isTeamMode ? filteredTeamProjects : filteredPersonalProjects;
  const currentSearchQuery = isTeamMode ? searchQuery : personalSearchQuery;
  const setCurrentSearchQuery = isTeamMode ? setSearchQuery : setPersonalSearchQuery;
  const currentDateFilterType = isTeamMode ? teamDateFilterType : personalDateFilterType;
  const setCurrentDateFilterType = isTeamMode ? setTeamDateFilterType : setPersonalDateFilterType;
  const currentYearFilter = isTeamMode ? teamYearFilter : personalYearFilter;
  const setCurrentYearFilter = isTeamMode ? setTeamYearFilter : setPersonalYearFilter;
  const currentMonthFilter = isTeamMode ? teamMonthFilter : personalMonthFilter;
  const setCurrentMonthFilter = isTeamMode ? setTeamMonthFilter : setPersonalMonthFilter;
  const currentSalesFilter = isTeamMode ? teamSalesFilter : personalSalesFilter;
  const setCurrentSalesFilter = isTeamMode ? setTeamSalesFilter : setPersonalSalesFilter;
  const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;
  const setCurrentProfileFilter = isTeamMode ? setProfileFilter : setPersonalProfileFilter;
  const activeStatusFilter = isTeamMode ? statusFilter : personalStatusFilter;
  const setActiveStatusFilter = isTeamMode ? setStatusFilter : setPersonalStatusFilter;
  const currentMemberFilter = isTeamMode ? teamMemberFilter : 'All Members';
  const setCurrentMemberFilter = isTeamMode ? setTeamMemberFilter : () => {};
`;
content = content.replace(/(const filteredTeamProjects = useMemo[\s\S]*?\]\);[\s\S]*?const filteredPersonalProjects = useMemo[\s\S]*?\]\);)/, "$1\n" + dynamicVars);

// The ternary replacement
content = content.replace(/workspaceMode === 'personal' \? \(/g, "false ? (");
content = content.replace(/workspaceMode === 'team' \? \(/g, "true ? (");

// JSX replacements
const returnIdx = content.indexOf('<main className="main-content">');
let beforeReturn = content.slice(0, returnIdx);
let afterReturn = content.slice(returnIdx);

afterReturn = afterReturn.replace(/filteredTeamProjects/g, "currentProjects");
afterReturn = afterReturn.replace(/searchQuery/g, "currentSearchQuery");
afterReturn = afterReturn.replace(/setSearchQuery/g, "setCurrentSearchQuery");
afterReturn = afterReturn.replace(/teamDateFilterType/g, "currentDateFilterType");
afterReturn = afterReturn.replace(/setTeamDateFilterType/g, "setCurrentDateFilterType");
afterReturn = afterReturn.replace(/teamYearFilter/g, "currentYearFilter");
afterReturn = afterReturn.replace(/setTeamYearFilter/g, "setCurrentYearFilter");
afterReturn = afterReturn.replace(/teamMonthFilter/g, "currentMonthFilter");
afterReturn = afterReturn.replace(/setTeamMonthFilter/g, "setCurrentMonthFilter");
afterReturn = afterReturn.replace(/teamSalesFilter/g, "currentSalesFilter");
afterReturn = afterReturn.replace(/setTeamSalesFilter/g, "setCurrentSalesFilter");
afterReturn = afterReturn.replace(/profileFilter/g, "currentProfileFilter");
afterReturn = afterReturn.replace(/setProfileFilter/g, "setCurrentProfileFilter");
afterReturn = afterReturn.replace(/statusFilter/g, "activeStatusFilter");
afterReturn = afterReturn.replace(/setStatusFilter/g, "setActiveStatusFilter");
afterReturn = afterReturn.replace(/teamMemberFilter/g, "currentMemberFilter");
afterReturn = afterReturn.replace(/setTeamMemberFilter/g, "setCurrentMemberFilter");

afterReturn = afterReturn.replace(/<select\s+className="filter-select"\s+value=\{currentMemberFilter\}/g, `<select
                    className="filter-select"
                    value={currentMemberFilter}
                    disabled={!isTeamMode}`);
                    
content = beforeReturn + afterReturn;

content = content.replace(/const totalTeamGross = filteredTeamProjects/g, "const totalTeamGross = currentProjects");
content = content.replace(/const totalTeamNet = filteredTeamProjects/g, "const totalTeamNet = currentProjects");

content = content.replace(/workspaceMode === 'team' && selectedTeamOrders.length > 0/g, "selectedTeamOrders.length > 0");

fs.writeFileSync('app/page.js', content, 'utf-8');
