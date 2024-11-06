const path = require('path');
const diskinfo = require('node-disk-info');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function getDiskUsage(terminal) {
    terminal.innerHTML += formatTextWithStyles(`<br>`);
    try {
        const disks = diskinfo.getDiskInfoSync();

        disks.forEach(disk => {
            const totalSpace = disk.blocks;
            const freeSpace = disk.available;
            const usedSpace = totalSpace - freeSpace;
            const diskUsagePercentage = ((usedSpace / totalSpace) * 100).toFixed(2);

            terminal.innerHTML += formatTextWithStyles(
                `<br><br>Utilisation du disque (${disk.mounted}): <strong><green>${diskUsagePercentage}%</green></strong> 
                (${(usedSpace / (1024 ** 3)).toFixed(2)} Go / ${(totalSpace / (1024 ** 3)).toFixed(2)} Go)`
            );
        });
    } catch (err) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur lors de la récupération de l'espace disque.</red>`);
    }
}
