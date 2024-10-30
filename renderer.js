const terminal = document.getElementById('terminal');
const input = document.getElementById('input');

let commandHistory = [];
let historyIndex = -1;

function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
}

function showWelcomeMessage() {
    terminal.innerHTML += formatTextWithStyles('<br><strong>Bienvenue sur <underline>TermHub <italic>1.0.0-b2</italic></underline></strong></underline> !<br>Tapez ? pour avoir de l\'aide<br>'); // Sauts de ligne avant le message
    scrollToBottom(); 
}

const commands = {
    clear: ['clear', 'clean', 'cls'],
    echo: ['echo', 'say'],
    help: ['help', '?'],
    os: ['os'],
    info: ['info', 'i'],
    file: ['file'],
    net: ['net'],
    cpuusage: ["cpuusage", "cpu"]
};

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = input.value.trim(); // Supprime les espaces inutiles

        // Si aucune commande
        if (command === '') return;

        commandHistory.push(command);
        historyIndex = commandHistory.length;

        // Exécuter la commande
        executeCommand(command);
        input.value = '';
    } else if (event.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (event.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            input.value = '';
            historyIndex = commandHistory.length;
        }
    }
});

function executeCommand(command) {
    const [cmd, ...args] = command.split(' ');

    if (commands.clear.includes(cmd)) {
        terminal.innerHTML = ''; // Efface
        scrollToBottom();
    } else if (commands.echo.includes(cmd)) {
        const formattedText = formatTextWithStyles(args.join(' '));
        terminal.innerHTML += '<br>' + formattedText;
        scrollToBottom();
    } else if (commands.help.includes(cmd)) {
        import('./src/commands/help.js').then(module => {
            terminal.innerHTML += formatTextWithStyles(module.help());
            scrollToBottom();
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de l'aide : ${err.message}`;
            scrollToBottom();
        });
    } else if (commands.os.includes(cmd)) {
        import('./src/commands/os.js').then(module => {
            module.osCommand(terminal); 
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });

    } else if (commands.info.includes(cmd)) {
        import('./src/commands/info.js').then(module => {
            module.infoCommand(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });    

    } else if (cmd === 'file-cd') {
        import('./src/commands/file.js').then(module => {
            module.cd(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-create') {
        import('./src/commands/file.js').then(module => {
            module.create(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-open') {
        import('./src/commands/file.js').then(module => {
            module.open(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-view') {
        import('./src/commands/file.js').then(module => {
            module.view(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-folder') {
        import('./src/commands/file.js').then(module => {
            module.folder(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === 'file-ls') {
        import('./src/commands/file.js').then(module => {
            module.file_ls(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'importation de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else if (cmd === "top") {
        scrollToBottom();
    
    } else if (commands.cpuusage.includes(cmd)) {
        import('./src/commands/cpuusage.js').then(module => {
            module.cpuUsage(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'net-ip') {
        import('./src/commands/net.js').then(module => {
            module.netIp(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'net-ping') {
        import('./src/commands/net.js').then(module => {
            module.netPing(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'mode-view') {
        import('./src/commands/mode.js').then(module => {
            module.modeView(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'mode-set') {
        import('./src/commands/mode.js').then(module => {
            module.modeSet(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'mode-liste') {
        import('./src/commands/mode.js').then(module => {
            module.modeList(terminal);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom()
        });
    } else if (cmd === 'apt-install') {
        import('./src/commands/file.js').then(module => {
            module.aptInstall(terminal, args);
        }).catch(err => {
            terminal.innerHTML += `<br>Erreur lors de l'exécution de la commande : ${err.message}`;
            scrollToBottom();
        });
    } else {
        terminal.innerHTML += `<br><br>Commande non trouvée: <red>${cmd}</red>`;
               scrollToBottom();
    }
}

showWelcomeMessage();

function formatTextWithStyles(text) {
    return text
        .replace(/<red>/g, '<span class="red">')
        .replace(/<\/red>/g, '</span>')
        .replace(/<green>/g, '<span class="green">')
        .replace(/<\/green>/g, '</span>')
        .replace(/<yellow>/g, '<span class="yellow">')
        .replace(/<\/yellow>/g, '</span>')
        .replace(/<blue>/g, '<span class="blue">')
        .replace(/<\/blue>/g, '</span>')
        .replace(/<underline>/g, '<span class="underline">')
        .replace(/<\/underline>/g, '</span>')
        .replace(/<italic>/g, '<span class="italic">')
        .replace(/<\/italic>/g, '</span>')
        .replace(/<strong>/g, '<strong>')
        .replace(/<\/strong>/g, '</strong>');
}
