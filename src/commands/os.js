const os = require('os');

module.exports = {
    COMMAND: "osfetch",
    helpModal: {
        description: "Get computer information",
        syntax: "osfetch [realtime [--refresh-rate|-r <seconds>]] [--show-ip|-ip] [--detailed|-md]",
        examples: [
            "osfetch",
            "osfetch --show-ip",
            "osfetch realtime",
            "osfetch realtime -r 0.5",
            "osfetch realtime --refresh-rate 2"
        ]
    },
    execute: (client, logSys, input, terminal, formatText) => {
        const formatBytes = (bytes) => {
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let i = 0;
            while (bytes >= 1024 && i < units.length - 1) {
                bytes /= 1024;
                i++;
            }
            return `${bytes.toFixed(2)} ${units[i]}`;
        };

        const formatUptime = (seconds) => {
            const days = Math.floor(seconds / (24 * 60 * 60));
            const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((seconds % (60 * 60)) / 60);
            const secs = Math.floor(seconds % 60);
            return `${days}d ${hours}h ${minutes}m ${secs}s`;
        };

        const getNetworkInfo = () => {
            const interfaces = os.networkInterfaces();
            const addresses = [];
            
            Object.keys(interfaces).forEach(iface => {
                interfaces[iface].forEach(details => {
                    if (details.family === 'IPv4' && !details.internal) {
                        addresses.push({ iface, address: details.address });
                    }
                });
            });
            
            return addresses;
        };

        const getSystemInfo = () => {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

            const info = {
                os: `${os.type()} ${os.release()} ${os.arch()}`,
                hostname: os.hostname(),
                cpus: `${os.cpus().length}x ${os.cpus()[0].model}`,
                memory: {
                    total: formatBytes(totalMem),
                    used: formatBytes(usedMem),
                    free: formatBytes(freeMem),
                    percent: memPercent
                },
                uptime: formatUptime(os.uptime())
            };

            if (client.cmdin.args.includes('--detailed') || client.cmdin.args.includes('-md')) {
                info.platform = os.platform();
                info.cpuDetails = os.cpus().map(cpu => ({
                    speed: cpu.speed,
                    times: cpu.times
                }));
                info.loadavg = os.loadavg();
            }

            if (client.cmdin.args.includes('--show-ip') || client.cmdin.args.includes('-ip')) {
                info.network = getNetworkInfo();
            }

            return info;
        };

        const displayInfo = (info) => {
            let output = `\n%%%bold%%%System Information%%%!bold%%%\n` +
                `\n%%%cyan%%%OS:%%%!cyan%%% ${info.os}` +
                `\n%%%cyan%%%Host:%%%!cyan%%% ${info.hostname}` +
                `\n%%%cyan%%%CPU:%%%!cyan%%% ${info.cpus}` +
                `\n%%%cyan%%%Memory:%%%!cyan%%% ${info.memory.used} / ${info.memory.total} (${info.memory.percent}%)` +
                `\n%%%cyan%%%Uptime:%%%!cyan%%% ${info.uptime}`;

            if (info.network) {
                output += `\n%%%cyan%%%Network:%%%!cyan%%%`;
                info.network.forEach(net => {
                    output += `\n  ${net.iface}: ${net.address}`;
                });
            }

            if (info.cpuDetails) {
                output += `\n%%%cyan%%%CPU Load:%%%!cyan%%% ${info.loadavg.map(load => load.toFixed(2)).join(', ')}`;
                output += `\n%%%cyan%%%CPU Details:%%%!cyan%%%`;
                info.cpuDetails.forEach((cpu, i) => {
                    output += `\n  Core ${i}: ${cpu.speed}MHz`;
                });
            }

            output += '\n';
            logSys.log(formatText(output));
        };

        if (client.cmdin.args.includes('realtime')) {
            const refreshArg = client.cmdin.args.indexOf('--refresh-rate');
            const shortRefreshArg = client.cmdin.args.indexOf('-r');
            let refreshRate = 1000; // Default 1 second

            if (refreshArg !== -1 || shortRefreshArg !== -1) {
                const rateIndex = refreshArg !== -1 ? refreshArg + 1 : shortRefreshArg + 1;
                const rate = parseFloat(client.cmdin.args[rateIndex]);
                
                if (!isNaN(rate) && rate > 0) {
                    refreshRate = rate * 1000; // Convert to milliseconds
                } else {
                    logSys.error('Invalid refresh rate. Using default (1 second)');
                }
            }

            let intervalId = setInterval(() => {
                terminal.innerHTML = ''; // Clear previous output
                displayInfo(getSystemInfo());
            }, refreshRate);

            // Stop monitoring on input
            const originalOnkeydown = input.onkeydown;
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    clearInterval(intervalId);
                    input.onkeydown = originalOnkeydown;
                }
            };
        } else {
            displayInfo(getSystemInfo());
        }
    }
};