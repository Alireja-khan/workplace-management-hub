const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// 1. Initial State Fixes
content = content.replace(
    /const \[personalStatusFilter, setPersonalStatusFilter\] = useState\('All Statuses'\);/,
    "const [personalStatusFilter, setPersonalStatusFilter] = useState('all');"
);
content = content.replace(
    /const \[personalSalesFilter, setPersonalSalesFilter\] = useState\('All Sales'\);/,
    "const [personalSalesFilter, setPersonalSalesFilter] = useState('all');"
);
content = content.replace(
    /const \[personalProfileFilter, setPersonalProfileFilter\] = useState\('All Profiles'\);/,
    "const [personalProfileFilter, setPersonalProfileFilter] = useState('all');"
);
content = content.replace(
    /const \[personalMonthFilter, setPersonalMonthFilter\] = useState\(MONTH_LIST\[new Date\(\)\.getMonth\(\)\]\);/,
    "const [personalMonthFilter, setPersonalMonthFilter] = useState('all');"
);
content = content.replace(
    /const \[personalYearFilter, setPersonalYearFilter\] = useState\(new Date\(\)\.getFullYear\(\)\.toString\(\)\);/,
    "const [personalYearFilter, setPersonalYearFilter] = useState('all');"
);
content = content.replace(
    /const \[personalDateFilterType, setPersonalDateFilterType\] = useState\('Assign Date'\);/,
    "const [personalDateFilterType, setPersonalDateFilterType] = useState('assign');"
);


// 2. Define activeOrderStatusFilter
const currentProfileFilterLine = "const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;";
const injectVars = `  const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;
  const setCurrentProfileFilter = isTeamMode ? setProfileFilter : setPersonalProfileFilter;
  const activeOrderStatusFilter = isTeamMode ? statusFilter : personalStatusFilter;
  const setActiveOrderStatusFilter = isTeamMode ? setStatusFilter : setPersonalStatusFilter;`;
content = content.replace(currentProfileFilterLine, injectVars);


// 3. UI Bindings Fixes (using precise strings without regex matches across newlines)
content = content.replace(
    /value=\{searchQuery\}\s*onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}/,
    `value={currentSearchQuery}
                    onChange={(e) => setCurrentSearchQuery(e.target.value)}`
);

content = content.replace(
    /value=\{teamDateFilterType\}\s*onChange=\{\(e\) => setTeamDateFilterType\(e\.target\.value\)\}/,
    `value={currentDateFilterType}
                        onChange={(e) => setCurrentDateFilterType(e.target.value)}`
);

content = content.replace(
    /value=\{teamYearFilter\}\s*onChange=\{\(e\) => setTeamYearFilter\(e\.target\.value\)\}/,
    `value={currentYearFilter}
                        onChange={(e) => setCurrentYearFilter(e.target.value)}`
);

content = content.replace(
    /value=\{teamMonthFilter\}\s*onChange=\{\(e\) => setTeamMonthFilter\(e\.target\.value\)\}/,
    `value={currentMonthFilter}
                        onChange={(e) => setCurrentMonthFilter(e.target.value)}`
);

content = content.replace(
    /value=\{teamSalesFilter\}\s*onChange=\{\(e\) => setTeamSalesFilter\(e\.target\.value\)\}/,
    `value={currentSalesFilter}
                        onChange={(e) => setCurrentSalesFilter(e.target.value)}`
);

content = content.replace(
    /value=\{profileFilter\}\s*onChange=\{\(e\) => setProfileFilter\(e\.target\.value\)\}/,
    `value={currentProfileFilter}
                        onChange={(e) => setCurrentProfileFilter(e.target.value)}`
);

content = content.replace(
    /value=\{statusFilter\}\s*onChange=\{\(e\) => setStatusFilter\(e\.target\.value\)\}/,
    `value={activeOrderStatusFilter}
                        onChange={(e) => setActiveOrderStatusFilter(e.target.value)}`
);

// 4. Reset Button Fixes
const resetOld = "setSearchQuery('');\\s*setProfileFilter\\('all'\\);\\s*setStatusFilter\\('all'\\);\\s*setCurrentStatusFilter\\('all'\\);\\s*setScheduleFilter\\('all'\\);\\s*setTeamMemberFilter\\('all'\\);\\s*setTeamSalesFilter\\('all'\\);\\s*setTeamYearFilter\\('all'\\);\\s*setTeamMonthFilter\\('all'\\);\\s*setTeamDateFilterType\\('assign'\\);\\s*setCurrentTab\\('all'\\);";
const resetNew = `setCurrentSearchQuery('');
                      setCurrentProfileFilter('all');
                      setActiveOrderStatusFilter('all');
                      setCurrentStatusFilter('all');
                      setScheduleFilter('all');
                      if (isTeamMode) setTeamMemberFilter('all');
                      setCurrentSalesFilter('all');
                      setCurrentYearFilter('all');
                      setCurrentMonthFilter('all');
                      setCurrentDateFilterType('assign');
                      setCurrentTab('all');`;

content = content.replace(new RegExp(resetOld), resetNew);

fs.writeFileSync('app/page.js', content, 'utf8');
