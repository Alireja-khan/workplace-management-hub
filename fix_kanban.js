const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// Replace the kanban board ternary with a single map
const oldKanbanStr = `{workspaceMode === 'team'
                    ? ['Wip', 'Delivered', 'Done', 'NRA', 'Need Requirements', 'Cancel'].map((colStatus) => {
                        const colItems = filteredTeamProjects.filter(
                          (p) => (p.orderStatus || 'Wip').toLowerCase() === colStatus.toLowerCase()
                        );`;
                        
const newKanbanStr = `{['Wip', 'Delivered', 'Done', 'NRA', 'Need Requirements', 'Cancel'].map((colStatus) => {
                        const colItems = currentProjects.filter(
                          (p) => (p.orderStatus || 'Wip').toLowerCase() === colStatus.toLowerCase()
                        );`;

content = content.replace(oldKanbanStr, newKanbanStr);

// The second part of the kanban ternary:
const oldKanbanTernaryFalse = `                      })
                    : ['Assigned', 'Wip', 'Issue', 'Delivered', 'Done'].map((colStatus) => {
                        const colItems = filteredProjects.filter((p) => (p.orderStatus || 'Assigned') === colStatus);
                        return (
                          <div key={colStatus} className="v-kanban-col">
                            <div className="v-kanban-header">
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                {colStatus}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)', background: 'var(--accents-1)', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid var(--border-default)' }}>
                                {colItems.length}
                              </span>
                            </div>
                            <div className="v-kanban-body">
                              {colItems.map((p) => (
                                <div key={p._id} className="v-kanban-card">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', fontWeight: 500 }}>
                                      {p.orderId || p._id.slice(-6).toUpperCase()}
                                    </span>
                                    {p.amount && (
                                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
                                        \${parseFloat(p.amount).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                                    {p.serviceName || p.clientUserId || 'Untitled Project'}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--accents-4)' }}>
                                      {p.assignDate ? new Date(p.assignDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}
                                    </span>
                                    <div className="v-kanban-avatar">
                                      {session?.user?.assignedName ? session.user.assignedName.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}`;

content = content.replace(oldKanbanTernaryFalse, `                      })}`);

fs.writeFileSync('app/page.js', content, 'utf8');
