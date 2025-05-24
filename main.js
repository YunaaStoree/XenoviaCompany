const { spawn } = require('child_process');

const bots = [
  { name: 'jyin', path: './jyin' },
  { name: 'jinyu', path: './jinyu' },
  { name: 'gina', path: './gina' }
];

for (const bot of bots) {
  const child = spawn('node', ['index.js'], {
    cwd: bot.path,
    stdio: 'inherit'
  });
  console.log(`Started bot: ${bot.name}`);
}
