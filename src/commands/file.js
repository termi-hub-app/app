const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process')
const formatTextWithStyles = require('./utils/formatTextWithStyles');

let currentDirectory = process.cwd();
export function execute(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucune commande spécifiée pour 'file'.`);
        return;
    }

    const command = args[0];
    switch (command) {
        case 'cd':
            cd(terminal, args.slice(1));
            break;
        case 'create':
            create(terminal, args.slice(1));
            break;
        case 'open':
            open(terminal);
            break;
        case 'view':
            view(terminal);
            break;
        case 'folder':
            folder(terminal, args.slice(1));
            break;
        case 'ls':
            file_ls(terminal);
            break;
        case 'apt-install':
            aptInstall(terminal, args.slice(1));
            break;
        default:
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Commande inconnue : ${command}`);
    }
}

function cd(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun chemin spécifié pour 'cd'.`);
        return;
    }
 
    const newDir = path.resolve(currentDirectory, args[0]);
    if (fs.existsSync(newDir) && fs.lstatSync(newDir).isDirectory()) {
        currentDirectory = newDir;
        terminal.innerHTML += formatTextWithStyles(`<br><br>Répertoire changé en : <green>${currentDirectory}</green>`);
    } else {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Répertoire non trouvé : ${newDir}`);
    }
}

function create(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun nom de fichier spécifié.`);
        return;
    }

    const filePath = path.join(currentDirectory, args[0]);
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de créer le fichier : ${err.message}`);
        } else {
            terminal.innerHTML += formatTextWithStyles(`<br><br>Fichier créé : <green>${filePath}</green>`);
        }
    });
}

function open(terminal) {
    terminal.innerHTML += formatTextWithStyles(`<br><br>Ouverture de l'explorateur de fichiers...`);

    const explorerCommand = process.platform === 'win32' 
        ? `explorer.exe "${currentDirectory}"` 
        : process.platform === 'darwin' 
        ? `open "${currentDirectory}"` 
        : `xdg-open "${currentDirectory}"`; // Pour Linux

    exec(explorerCommand, (err, stdout, stderr) => {
            terminal.innerHTML += formatTextWithStyles(`<br><br>Emplacement ouvert`);
      

        if (stdout) {
            console.log(`Sortie standard : ${stdout}`);
        }

        if (stderr) {
            console.error(`Sortie d'erreur : ${stderr}`);
        }
    });
}

function view(terminal) {
    terminal.innerHTML += formatTextWithStyles(`<br><br>Emplacement courant : <green>${currentDirectory}</green>`);
}

function folder(terminal, args) {
    if (!args || args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun nom de dossier spécifié.`);
        return;
    }

    const dirPath = path.join(currentDirectory, args[0]);
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de créer le dossier : ${err.message}`);
        } else {
            terminal.innerHTML += formatTextWithStyles(`<br><br>Dossier créé : <green>${dirPath}</green>`);
        }
    });
}

function file_ls(terminal) {
    fs.readdir(currentDirectory, (err, files) => {
        if (err) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de lire le répertoire : ${err.message}`);
            return;
        }

        terminal.innerHTML += formatTextWithStyles(`<br><br><strong>Liste des fichiers :</strong>`);
        files.forEach(file => {
            const filePath = path.join(currentDirectory, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de lire les informations du fichier : ${file}`);
                    return;
                }

                const fileSize = `${(stats.size / 1024).toFixed(2)} KB`;
                const fileDate = stats.mtime.toLocaleString();
                const fileType = stats.isDirectory() ? 'Dossier' : 'Fichier';

                terminal.innerHTML += formatTextWithStyles(`<br><br>Nom: ${file} | Type: ${fileType} | Date: ${fileDate} | Taille: ${fileSize}`);
            });
        });
    });
}

function aptInstall(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun paquet spécifié pour 'apt-install'.`);
        return;
    }

    const packageName = args.join(' '); // Combiner les paquets
    terminal.innerHTML += formatTextWithStyles(`<br><br>Installation de : <green>${packageName}</green>...`);

    // Utilisation de Chocolatey
    const installProcess = spawn('choco', ['install', packageName, '-y'], {
        cwd: currentDirectory,
        shell: true,
    });

    installProcess.stdout.on('data', (data) => {
        terminal.innerHTML += formatTextWithStyles(`<br><br><green>Data : </green><red>${data}</red>`);
    });

    installProcess.stderr.on('data', (data) => {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> ${data}`);
    });

    installProcess.on('close', (code) => {
        if (code === 0) {
            terminal.innerHTML += formatTextWithStyles(`<br><br><green>Installation terminée avec succès.</green>`);
        } else {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Installation échouée avec le code : ${code}</red>`);
        }
    });
}
