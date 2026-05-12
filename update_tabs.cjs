const fs = require('fs');

['src/pages/AdminDashboard.tsx', 'src/pages/ClientDashboard.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add appearance to type string 
  content = content.replace(/useState<'general' \| 'privacy'>\('general'\)/g, "useState<'general' | 'privacy' | 'appearance'>('general')");

  // Add the tab button
  const buttonCode = `
                    <button 
                      onClick={() => setSettingsTab('appearance')}
                      className={clsx("text-left px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors", settingsTab === 'appearance' ? "bg-surface-alt text-text-main font-semibold shadow-sm border border-border-color" : "text-text-muted hover:text-text-main hover:bg-surface-alt/50 border border-transparent")}
                    >
                      Внешний вид
                    </button>`;
  content = content.replace(/Политика конфиденциальность Vantorix\s*<\/button>/g, 'Политика конфиденциальность Vantorix\n                    </button>' + buttonCode);

  // Add the tab content
  const tabContent = `
                    {settingsTab === 'appearance' && (
                       <div className="bg-surface rounded-[24px] p-8 shadow-sm border border-border-color card-premium">
                         <h3 className="text-[18px] font-bold text-text-main tracking-tight mb-6">Внешний вид (Тема)</h3>
                         <div className="text-text-muted leading-relaxed text-[13px]">
                           <ThemeToggle />
                         </div>
                       </div>
                    )}`;
  content = content.replace(/<PrivacyPolicyContent \/>\s*<\/div>\s*<\/div>\s*\)}/g, '<PrivacyPolicyContent />\n                          </div>\n                       </div>\n                    )}\n' + tabContent);

  fs.writeFileSync(file, content);
});
