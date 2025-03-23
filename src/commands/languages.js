const path = require('path');
const fs = require('fs');
const https = require('https');
const AdmZip = require('adm-zip');

const I18N = require('../utils/i18n');
const _locale = new I18N(path.join(__dirname, '..', 'locales'));

module.exports = {
    COMMAND: "lang",
    helpModal: {
        description: "Manage the application language",
        usage: "lang <set|list|install|uninstall> [language-region|url]"
    },
    execute: async (client, logSys, input, terminal, formatText) => {
        const action = client.cmdin.args[0];
        const language = client.cmdin.args[1];

        if (!action) {
            logSys.error("Please specify an action: set, list, install, or uninstall");
            return;
        }

        const localesPath = path.join(__dirname, '..', 'locales');

        switch (action.toLowerCase()) {
            case 'list':
                const languages = [];
                const mainLangs = fs.readdirSync(localesPath);
                
                mainLangs.forEach(lang => {
                    const regions = fs.readdirSync(path.join(localesPath, lang));
                    regions.forEach(region => {
                        if (fs.existsSync(path.join(localesPath, lang, region, 'Console.json'))) {
                            languages.push(`${lang}-${region}`);
                        }
                    });
                });
                
                logSys.log("\nAvailable languages:");
                languages.forEach(lang => {
                    const isActive = lang === localStorage.getItem('language') ? ' (active)' : '';
                    logSys.log(`- ${lang}${isActive}`);
                });
                break;

            case 'set':
                if (!language) {
                    logSys.error("Please specify a language-region code (e.g., en-us, fr-fr)");
                    return;
                }

                const [langCode, regionCode] = language.toLowerCase().split('-');
                const langPath = path.join(localesPath, langCode, regionCode);

                if (!fs.existsSync(langPath) || !fs.existsSync(path.join(langPath, 'Console.json'))) {
                    logSys.error(`Language '${language}' not found or incomplete`);
                    return;
                }

                localStorage.setItem('language', language);
                _locale.setLanguage(language);
                logSys.success(`Language set to ${language}`);
                break;

            case 'install':
                if (!language || !language.startsWith('http')) {
                    logSys.error("Please specify a valid language pack URL");
                    return;
                }
                if (!language.endsWith('.zip')) {
                    logSys.error('The provided URL is not a ZIP file')
                }

                const tempFile = path.join(os.tmpdir(), 'language.zip');
                
                try {
                    logSys.info('Downloading language pack...');
                    await new Promise((resolve, reject) => {
                        const file = fs.createWriteStream(tempFile);
                        https.get(language, (response) => {
                            if (response.statusCode !== 200) {
                                reject(new Error(`Failed to download: ${response.statusCode}`));
                                return;
                            }

                            response.pipe(file);
                            file.on('finish', () => {
                                file.close();
                                resolve();
                            });
                        }).on('error', reject);
                    });

                    logSys.info('Extracting language files...');
                    const zip = new AdmZip(tempFile);
                    zip.extractAllTo(localesPath, true);
                    
                    fs.unlinkSync(tempFile);
                    logSys.success('Language pack installed successfully');
                } catch (error) {
                    logSys.error(`Installation failed: ${error.message}`);
                }
                break;

            case 'uninstall':
                if (!language) {
                    logSys.error("Please specify a language-region code to uninstall");
                    return;
                }

                const [langToDelete, regionToDelete] = language.toLowerCase().split('-');
                const pathToDelete = path.join(localesPath, langToDelete, regionToDelete);

                if (!fs.existsSync(pathToDelete)) {
                    logSys.error(`Language '${language}' not found`);
                    return;
                }

                if ((langToDelete === 'en' && regionToDelete === 'us') || 
                    (langToDelete === 'fr' && regionToDelete === 'fr')) {
                    logSys.error("Cannot uninstall default languages (en-us and fr-fr)");
                    return;
                }

                try {
                    fs.rmSync(pathToDelete, { recursive: true, force: true });
                    logSys.success(`Language ${language} uninstalled successfully`);
                } catch (error) {
                    logSys.error(`Failed to uninstall language: ${error.message}`);
                }
                break;

            default:
                logSys.error("Invalid action. Available actions: set, list, install, uninstall");
        }
    }
}
