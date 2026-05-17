const fs = require('fs');
const lines = fs.readFileSync('src/components/EditorView.tsx', 'utf8').split('\n');
// Line 165 is index 164
lines[164] = 'export function EditorView({ initialPrompt, onOpenSidebar, sidebarOpen, completionScope, username, onLogout, onRequireLogin, loreSettings }: EditorViewProps) {';
fs.writeFileSync('src/components/EditorView.tsx', lines.join('\n'));
