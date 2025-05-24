const { spawn } = require('child_process');

const bots = [
  { name: 'feyy', path: './feyy' },
  { name: 'jyin', path: './jyin' },
  { name: 'mei',  path: './mei' },
  { name: 'carmen', path: './carmen' },
  { name: 'jinyu', path: './jinyu' },
  { name: 'mei', path: './mei' },
  { name: 'yuyu', path: './yuyu' },
  { name: 'yuna', path: './yuna' },
  { name: 'gina', path: './gina' }
];

for (const bot of bots) {
  const child = spawn('node', ['index.js'], {
    cwd: bot.path,
    stdio: 'inherit'
  });
  console.log(`Started bot: ${bot.name}`);
}
