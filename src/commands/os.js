const os = require('os');
const path = require('path');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function osCommand(terminal) {
  const userInfo = os.userInfo();
  const platform = os.platform();
  const release = os.release();
  const uptime = os.uptime();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const cpuInfo = os.cpus()[0].model;

  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);

  terminal.innerHTML += formatTextWithStyles(`
<br><br>
<strong>Système d'exploitation : </strong>${platform}<br>
<strong>Version : </strong>${release}<br>
<strong>Nom d'utilisateur : </strong>${userInfo.username}<br>
<strong>Uptime : </strong>${uptimeHours}h ${uptimeMinutes}m<br>
<strong>Mémoire totale : </strong>${(totalMemory / (1024 ** 2)).toFixed(2)} Mo<br>
<strong>Mémoire libre : </strong>${(freeMemory / (1024 ** 2)).toFixed(2)} Mo<br>
<strong>Processeur : </strong>${cpuInfo}
  `);
  
  scrollToBottom();
}
