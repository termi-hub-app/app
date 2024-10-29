

export function infoCommand(terminal) {

  terminal.innerHTML += formatTextWithStyles(`
<br>
<strong><underline><italic>Informations</italic></underline></srtong><br>
Version : 1.0.0-b1
  `);
  
  scrollToBottom();
}
