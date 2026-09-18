const fs = require('fs');
let code = fs.readFileSync('app/page.js', 'utf-8');
const isCRLF = code.includes('\r\n');
if (isCRLF) {
  code = code.replace(/\r\n/g, '\n');
}

// 1. Workspace mode useEffect
const target1 = `  // When switching workspace mode, default to showing WIP / Running orders table
  useEffect(() => {
    setCurrentTab('running');
    setTeamMemberFilter('all');
    setTeamSalesFilter('all');
    setTeamYearFilter('all');
    setTeamMonthFilter('all');
    setTeamDateFilterType('assign');
    setProfileFilter('all');
    setStatusFilter('all');
  }, [workspaceMode]);`;

const rep1 = `  // When switching workspace mode, default to showing WIP / Running orders table for team, All Orders for personal
  useEffect(() => {
    setCurrentTab(workspaceMode === 'team' ? 'running' : 'all');
    setTeamMemberFilter('all');
    setTeamSalesFilter('all');
    setPersonalSalesFilter('all');
    setTeamYearFilter('all');
    setPersonalYearFilter('all');
    setTeamMonthFilter('all');
    setPersonalMonthFilter('all');
    setTeamDateFilterType('assign');
    setPersonalDateFilterType('assign');
    setProfileFilter('all');
    setPersonalProfileFilter('all');
    setStatusFilter('all');
    setPersonalStatusFilter('all');
  }, [workspaceMode]);`;

// 2. All members bug
const target2 = `      if ('All Members'.toLowerCase() !== 'all') {
        if (!Array.isArray(p.assignedMembers) || !p.assignedMembers.some((m) => m.toLowerCase() === 'All Members'.toLowerCase())) {
          return false;
        }
      }`;

// 3. Dependency array
const target3 = `  }, [teamProjects, currentTab, 'All Members', personalSalesFilter,`;
const rep3 = `  }, [teamProjects, currentTab, personalSalesFilter,`;

// 4. Sidebar button
const target4 = `<Plus size={14} /> Add Team Order`;
const rep4 = `<Plus size={14} /> {workspaceMode === 'team' ? 'Add Team Order' : 'Add Order'}`;

// 5. Team Member Filter dropdown
const target5 = `                    {/* Team Member Filter */}
                    <select
                      className="v-select"
                      value={teamMemberFilter}
                      onChange={(e) => setTeamMemberFilter(e.target.value)}
                    >
                      <option value="all">All Members ({teamMemberList.length})</option>
                      {teamMemberList.map((m) => (
                        <option key={m} value={m}>{m} ({teamMemberCounts[m] || 0})</option>
                      ))}
                    </select>`;

const rep5 = `                    {/* Team Member Filter */}
                    {workspaceMode === 'team' && (
                      <select
                        className="v-select"
                        value={teamMemberFilter}
                        onChange={(e) => setTeamMemberFilter(e.target.value)}
                      >
                        <option value="all">All Members ({teamMemberList.length})</option>
                        {teamMemberList.map((m) => (
                          <option key={m} value={m}>{m} ({teamMemberCounts[m] || 0})</option>
                        ))}
                      </select>
                    )}`;

// 6. Reset button
const target6 = `                <button
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
                  }}
                  title="Reset Filters"
                >`;

const rep6 = `                <button
                  className="btn-v btn-v-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setPersonalSearchQuery('');
                    setProfileFilter('all');
                    setPersonalProfileFilter('all');
                    setStatusFilter('all');
                    setPersonalStatusFilter('all');
                    setCurrentStatusFilter('all');
                    setScheduleFilter('all');
                    setTeamMemberFilter('all');
                    setTeamSalesFilter('all');
                    setPersonalSalesFilter('all');
                    setTeamYearFilter('all');
                    setPersonalYearFilter('all');
                    setTeamMonthFilter('all');
                    setPersonalMonthFilter('all');
                    setTeamDateFilterType('assign');
                    setPersonalDateFilterType('assign');
                    setCurrentTab('all');
                  }}
                  title="Reset Filters"
                >`;

// 7. Table Header
const target7 = `                          <th>Assigned Member(s)</th>`;
const rep7 = `                          {workspaceMode === 'team' && <th>Assigned Member(s)</th>}`;

// 8. Empty state
const target8 = `                        currentProjects.length === 0 ? (
                          <tr>
                            <td colSpan={16} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--accents-5)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--foreground)' }}>
                                  No team orders found matching your filters.
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--accents-4)' }}>
                                  Click <button type="button" onClick={openNewTeamModal} style={{ color: '#38bdf8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add Team Order</button> to create one.
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) :`;

const rep8 = `                        currentProjects.length === 0 ? (
                          <tr>
                            <td colSpan={workspaceMode === 'team' ? 16 : 15} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--accents-5)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--foreground)' }}>
                                  {workspaceMode === 'team' ? 'No team orders found matching your filters.' : 'No personal orders found matching your filters.'}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--accents-4)' }}>
                                  Click <button type="button" onClick={openNewTeamModal} style={{ color: '#38bdf8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{workspaceMode === 'team' ? '+ Add Team Order' : '+ Add Order'}</button> to create one.
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) :`;

// 9. Table Row Assigned Members
const target9 = `                                <td>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {members.length > 0 ? (
                                      members.map((m) => (
                                        <span key={m} style={{ fontSize: '0.7rem', background: 'var(--accents-1)', border: '1px solid var(--border-subtle)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>
                                          {m}
                                        </span>
                                      ))
                                    ) : (
                                      <span style={{ color: 'var(--accents-4)', fontSize: '0.75rem' }}>-</span>
                                    )}
                                  </div>
                                </td>`;

const rep9 = `                                {workspaceMode === 'team' && (
                                  <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                      {members.length > 0 ? (
                                        members.map((m) => (
                                          <span key={m} style={{ fontSize: '0.7rem', background: 'var(--accents-1)', border: '1px solid var(--border-subtle)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>
                                            {m}
                                          </span>
                                        ))
                                      ) : (
                                        <span style={{ color: 'var(--accents-4)', fontSize: '0.75rem' }}>-</span>
                                      )}
                                    </div>
                                  </td>
                                )}`;

console.log('Target 1 exists:', code.includes(target1));
console.log('Target 2 exists:', code.includes(target2));
console.log('Target 3 exists:', code.includes(target3));
console.log('Target 4 exists:', code.includes(target4));
console.log('Target 5 exists:', code.includes(target5));
console.log('Target 6 exists:', code.includes(target6));
console.log('Target 7 exists:', code.includes(target7));
console.log('Target 8 exists:', code.includes(target8));
console.log('Target 9 exists:', code.includes(target9));

if (code.includes(target1) && code.includes(target2) && code.includes(target3) && code.includes(target4) && code.includes(target5) && code.includes(target6) && code.includes(target7) && code.includes(target8) && code.includes(target9)) {
  code = code.replace(target1, rep1);
  code = code.replace(target2, '');
  code = code.replace(target3, rep3);
  code = code.replace(target4, rep4);
  code = code.replace(target5, rep5);
  code = code.replace(target6, rep6);
  code = code.replace(target7, rep7);
  code = code.replace(target8, rep8);
  code = code.replace(target9, rep9);

  if (isCRLF) {
    code = code.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync('app/page.js', code, 'utf-8');
  console.log('SUCCESSFULLY APPLIED ALL FIXES TO app/page.js!');
} else {
  console.error('FAILED TO FIND SOME TARGETS');
}
