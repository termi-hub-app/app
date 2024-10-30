let currentMode = 'default'; 

const themes = {
    default: {
        backgroundColor: 'black',
        color: 'white',
        '--scrollbar-track': '#1b1b1b',
        '--scrollbar-thumb': '#555',
    },
    halloween: {
        backgroundColor: '#1a1a1a',
        color: '#ff7518', 
        '--scrollbar-track': '#2c2c2c',
        '--scrollbar-thumb': '#ff7518',
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName] || themes.default;
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.color;
    document.documentElement.style.setProperty('--scrollbar-track', theme['--scrollbar-track']);
    document.documentElement.style.setProperty('--scrollbar-thumb', theme['--scrollbar-thumb']);
}

export function modeView(terminal) {
    terminal.innerHTML += formatTextWithStyles(`<br>Mode actuel : <green>${currentMode}</green>`);
}

export function modeSet(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><red>Erreur :</red> Aucun mode spécifié pour 'mode-set'.`);
        return;
    }

    const newMode = args[0].toLowerCase();
    if (themes[newMode]) {
        currentMode = newMode;
        applyTheme(currentMode);
        terminal.innerHTML += formatTextWithStyles(`<br>Mode changé en : <green>${currentMode}</green>`);
    } else {
        terminal.innerHTML += formatTextWithStyles(`<br><red>Erreur :</red> Mode non trouvé : ${newMode}`);
    }
}


export function modeList(terminal) {
    const themeNames = Object.keys(themes);
    terminal.innerHTML += formatTextWithStyles(`<br>Thèmes disponibles :`);
    themeNames.forEach(theme => {
        terminal.innerHTML += formatTextWithStyles(`<br>- <green>${theme}</green>`);
    });
}
