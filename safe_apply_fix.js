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
const injectVars = `  const currentProfileFilter = isTeamMode ? profileFilter : personalProfileFilter;
  const setCurrentProfileFilter = isTeamMode ? setProfileFilter : setPersonalProfileFilter;
  const activeOrderStatusFilter = isTeamMode ? statusFilter : personalStatusFilter;
  const setActiveOrderStatusFilter = isTeamMode ? setStatusFilter : setPersonalStatusFilter;`;
content = content.replace(
    /const currentProfileFilter = isTeamMode \? profileFilter : personalProfileFilter;/,
    injectVars
);


// 3. UI Bindings Fixes (using exact chunks)
// Search Query
content = content.replace(
    `value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}`,
    `value={currentSearchQuery}
                    onChange={(e) => setCurrentSearchQuery(e.target.value)}`
);

// Date Filter Type
content = content.replace(
    `value={teamDateFilterType}
                        onChange={(e) => setTeamDateFilterType(e.target.value)}`,
    `value={currentDateFilterType}
                        onChange={(e) => setCurrentDateFilterType(e.target.value)}`
);

// Year Filter
content = content.replace(
    `value={teamYearFilter}
                        onChange={(e) => setTeamYearFilter(e.target.value)}`,
    `value={currentYearFilter}
                        onChange={(e) => setCurrentYearFilter(e.target.value)}`
);

// Month Filter
content = content.replace(
    `value={teamMonthFilter}
                        onChange={(e) => setTeamMonthFilter(e.target.value)}`,
    `value={currentMonthFilter}
                        onChange={(e) => setCurrentMonthFilter(e.target.value)}`
);

// Sales Filter
content = content.replace(
    `value={teamSalesFilter}
                        onChange={(e) => setTeamSalesFilter(e.target.value)}`,
    `value={currentSalesFilter}
                        onChange={(e) => setCurrentSalesFilter(e.target.value)}`
);

// Profile Filter
content = content.replace(
    `value={profileFilter}
                        onChange={(e) => setProfileFilter(e.target.value)}`,
    `value={currentProfileFilter}
                        onChange={(e) => setCurrentProfileFilter(e.target.value)}`
);

// Order Status Filter
content = content.replace(
    `value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}`,
    `value={activeOrderStatusFilter}
                        onChange={(e) => setActiveOrderStatusFilter(e.target.value)}`
);

// 4. Reset Button Fixes
const oldReset = `                  <button
                    className="btn-v btn-v-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setProfileFilter('all');
                      setStatusFilter('all');
                      setCurrentStatusFilter('all');
                      setScheduleFilter('all');
                      setTeamMemberFilter('all');
                      setTeamSalesFilter('all');
                      setTeamYearFilter('all');
                      setTeamMonthFilter('all');
                      setTeamDateFilterType('assign');
                      setCurrentTab('all');
                    }}`;
const newReset = `                  <button
                    className="btn-v btn-v-secondary"
                    onClick={() => {
                      setCurrentSearchQuery('');
                      setCurrentProfileFilter('all');
                      setActiveOrderStatusFilter('all');
                      setCurrentStatusFilter('all'); // Issue status
                      setScheduleFilter('all');
                      if (isTeamMode) {
                        setTeamMemberFilter('all');
                      }
                      setCurrentSalesFilter('all');
                      setCurrentYearFilter('all');
                      setCurrentMonthFilter('all');
                      setCurrentDateFilterType('assign');
                      setCurrentTab('all');
                    }}`;
content = content.replace(oldReset, newReset);

fs.writeFileSync('app/page.js', content, 'utf8');
