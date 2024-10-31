const ping = require('ping');
const { networkInterfaces } = require('os');
const traceroute = require('traceroute')
const formatTextWithStyles = require('./utils/formatTextWithStyles');

export function netPing(terminal, args) {
    if (args.length === 0) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun hôte spécifié pour 'net-ping'.`);
        return;
    }

    ping.promise.probe(args[0])
        .then(res => {
            if (res.alive) {
                terminal.innerHTML += formatTextWithStyles(`<br><br>Ping réussi vers ${args[0]} : ${res.time} ms`);
            } else {
                terminal.innerHTML += formatTextWithStyles(`<br<br><red>Ping échoué :</red> ${args[0]} est injoignable.`);
            }
        })
        .catch(err => {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de pinger ${args[0]} : ${err.message}`);
        });
}

export function netIp(terminal) {
    const nets = networkInterfaces();
    const results = Object.create(null);

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    terminal.innerHTML += formatTextWithStyles(`<br><br>Adresse IP(s) : <green>${Object.values(results).flat().join(', ')}</green>`);
}
