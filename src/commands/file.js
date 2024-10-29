const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process')

let currentDirectory = process.cwd();

export function cd(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += `<br><red>Erreur :</red> Aucun chemin spécifié pour 'cd'.`;
        return;
    }

    const newDir = path.resolve(currentDirectory, args[0]);
    if (fs.existsSync(newDir) && fs.lstatSync(newDir).isDirectory()) {
        currentDirectory = newDir;
        terminal.innerHTML += `<br>Répertoire changé en : <green>${currentDirectory}</green>`;
    } else {
        terminal.innerHTML += `<br><red>Erreur :</red> Répertoire non trouvé : ${newDir}`;
    }
}

export function create(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += `<br><red>Erreur :</red> Aucun nom de fichier spécifié.`;
        return;
    }

    const filePath = path.join(currentDirectory, args[0]);
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            terminal.innerHTML += `<br><red>Erreur :</red> Impossible de créer le fichier : ${err.message}`;
        } else {
            terminal.innerHTML += `<br>Fichier créé : <green>${filePath}</green>`;
        }
    });
}

export function open(terminal) {
    terminal.innerHTML += `<br>Ouverture de l'explorateur de fichiers...`;

    const explorerCommand = process.platform === 'win32' 
        ? `explorer.exe "${currentDirectory}"` 
        : process.platform === 'darwin' 
        ? `open "${currentDirectory}"` 
        : `xdg-open "${currentDirectory}"`; // Pour Linux

    exec(explorerCommand, (err, stdout, stderr) => {
            terminal.innerHTML += `<br>Emplacement ouvert`;
      

        if (stdout) {
            console.log(`Sortie standard : ${stdout}`);
        }

        if (stderr) {
            console.error(`Sortie d'erreur : ${stderr}`);
        }
    });
}

export function view(terminal) {
    terminal.innerHTML += `<br>Emplacement courant : <green>${currentDirectory}</green>`;
}

export function folder(terminal, args) {
    if (!args || args.length === 0) {
        terminal.innerHTML += `<br><red>Erreur :</red> Aucun nom de dossier spécifié.`;
        return;
    }

    const dirPath = path.join(currentDirectory, args[0]);
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            terminal.innerHTML += `<br><red>Erreur :</red> Impossible de créer le dossier : ${err.message}`;
        } else {
            terminal.innerHTML += `<br>Dossier créé : <green>${dirPath}</green>`;
        }
    });
}
