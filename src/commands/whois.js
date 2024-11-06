const dns = require('dns');
const path = require('path');
const ping = require('ping');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function whoisCommand(terminal, url, options = {}) {
    const { ipv4, ipv6, ping: shouldPing } = options;

    const resolveIP = (address) => {
        terminal.innerHTML += formatTextWithStyles(`
            <br><br><strong>Adresse IP de ${url} :</strong> ${address}
        `);
        if (shouldPing) {
            pingServer(address, terminal);
        }
    };

    if (ipv4) {
        dns.resolve4(url, (err, addresses) => {
            if (err) {
                terminal.innerHTML += formatTextWithStyles(`<br><br>Erreur de résolution IPv4 : ${err.message}`);
            } else {
                resolveIP(addresses[0]);
            }
        });
    } else if (ipv6) {
        dns.resolve6(url, (err, addresses) => {
            if (err) {
                terminal.innerHTML += formatTextWithStyles(`<br><br>Erreur de résolution IPv6 : ${err.message}`);
            } else {
                resolveIP(addresses[0]);
            }
        });
    } else {
        dns.lookup(url, (err, address, family) => {
            if (err) {
                terminal.innerHTML += formatTextWithStyles(`<br><br>Erreur de résolution : ${err.message}`);
            } else {
                terminal.innerHTML += formatTextWithStyles(`
                    <br><br><strong>Adresse IP par défaut de ${url} :</strong> ${address} (IPv${family})
                `);
                if (shouldPing) {
                    pingServer(address, terminal);
                }
            }
        });
    }

    scrollToBottom();
}

/**
 * @param {string} ip 
 * @param {object} terminal 
 */
function pingServer(ip, terminal) {
    if (!ip) {
        terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Aucun hôte spécifié pour ''.`);
        return;
    }

    ping.promise.probe(ip)
        .then(res => {
            if (res.alive) {
                terminal.innerHTML += formatTextWithStyles(`<br><br>Ping réussi vers ${ip} : ${res.time} ms`);
            } else {
                terminal.innerHTML += formatTextWithStyles(`<br><br><red>Ping échoué :</red> ${ip} est injoignable.`);
            }
        })
        .catch(err => {
            terminal.innerHTML += formatTextWithStyles(`<br><br><red>Erreur :</red> Impossible de pinger ${ip} : ${err.message}`);
        });
}
