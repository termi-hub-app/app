const os = require('os');
const fs = require('fs');
const path = require('path');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));


export function memUsage(terminal) {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);
    terminal.innerHTML += formatTextWithStyles(`<br>`);
    terminal.innerHTML += formatTextWithStyles(
        `<br><br>Utilisation de la mémoire : <strong><green>${memUsagePercentage}%</green></strong> 
        (${(usedMemory / (1024 ** 3)).toFixed(2)} Go / ${(totalMemory / (1024 ** 3)).toFixed(2)} Go)`
    );
}
