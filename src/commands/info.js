const path = require('path');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function infoCommand(terminal) {

  terminal.innerHTML += formatTextWithStyles(`
<br><br><strong><underline><italic>Informations</italic></underline></srtong><br>
Version : 1.0.0-b3

<strong>Developpeur : <green>liveweeeb</green></strong>
<strong>Discord : <purple>https://discord.gg/4baaMs9Mnt</purple></strong>
  `);
  
  scrollToBottom();
}
