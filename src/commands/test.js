const path = require('path');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function testCommand(terminal) {

  terminal.innerHTML += formatTextWithStyles(`
<br><br><strong>Type de text (<italic>aide pour la creation de theme</italic>) :</strong>

Text normal
<red>Text rouge</red>
<green>Text rouge</green>
<yellow>Text rouge</yellow>
<purple>Text rouge</purple>
<blue>Text rouge</blue>

<br><underline>Text souligné normal
<red>Text souligné rouge</red>
<green>Text souligné vert</green>
<yellow>Text souligné jaune</yellow>
<purple>Text souligné violet</purple>
<blue>Text souligné bleu</blue></underline>

<br><italic>Text en italique normal
<red>Text en italique rouge</red>
<green>Text en italique vert</green>
<yellow>Text en italique jaune</yellow>
<purple>Text en italique violet</purple>
<blue>Text en italique bleu</blue></italic>

<br><strong>Text en gras normal
<red>Text en gras rouge</red>
<green>Text en gras vert</green>
<yellow>Text en gras jaune</yellow>
<purple>Text en gras violet</purple>
<blue>Text en gras bleu</blue></strong>
  `);
  
  scrollToBottom();
}
