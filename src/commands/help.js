export function help() {
    return `
<br><br><strong>Liste des commandes disponibles :</strong><br>
- clear | clean | cls : Efface le terminal
- echo | say : Affiche un message
- help | ? : Affiche cette liste d'aide
- os : Affiche les informations de votre pc
- info : Affiche les info du terminal
- file-cd : Change de repertoire
- file-create : Creer un nouveau fichier
- file-folder : Creer un nouveau dossier
- file-view : Affiche le repertoire
- file-open : Ouvre le repertoire

- file-ls : Liste les fichier du repertoire
- net-ping <url> : Ping l'url fournie
- net-ip : Affiche les ip (Eth 3, Eth2, Wifi)
- cpu : Affiche l'utilisation du CPU
- mode-view : Affiche le mode actuel
- mode-liste: Affiche les modes disponibles
- mode-set : Change le theme
- apt-install : Install un package (doit avoir choco)
    `;
  }
  