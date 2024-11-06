const path = require('path');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function help(terminal) {
     return`
 <br><br><strong>Liste des commandes disponibles :</strong><br>
 - clear | clean | cls : Efface le terminal
 - echo | say : Affiche un message
 - help | ? : Affiche cette liste d'aide
 - os : Affiche les informations de votre pc
 - info | i : Affiche les info du terminal
 - file-cd | cd : Change de repertoire
 - file-create | create : Creer un nouveau fichier
 - file-folder | folder : Creer un nouveau dossier
 - file-view : Affiche le repertoire
 - file-open | open : Ouvre le repertoire
 - file-ls | ls : Liste les fichiers du repertoire
 - net-ping | ping <url> : Ping l'url ou l'ip fournie
 - net-ip | ip : Affiche les ip (Eth 3, Eth2, Wifi)
 - cpu : Affiche l'utilisation du CPU
 - theme-view : Affiche le theme actuel
 - theme-liste | liste : Affiche les themes disponibles
 - theme-set : Change le theme
 - apt-install : Install un package (doit avoir choco)
 - theme-install | theme-add <nom du theme> : Installe le theme
 - theme-uninstall | theme-remove <nom du theme> : Desinstalle le theme 
 - test : Affiche les different type de texte present
 - 🆕 whois &lt;url&gt (option) : Récupère les informations de domaine pour l'URL spécifiée.
<strong>Options disponibles</strong> :
    - <strong><purple>ipv4</purple></strong> : Envoie l'adresse IP au format IPv4 .
    - <strong><purple>ipv6</purple></strong> :  Envoie l'adresse IP au format IPv6.
    - <strong><purple>ping</purple></strong> : Ping l'adresse IP obtenue.
 - 🆕 ram : Affiche l'utilisation de la memoire RAM
 - 🆕 disk : Affiche l'utilisation des disques
     `;
 
 }