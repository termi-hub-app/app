// Language Utility
/*
 ____ ____ ____ ____ 
||i |||1 |||8 |||n ||
||__|||__|||__|||__||
|/__\|/__\|/__\|/__\|

*/

/*
Author: Befaci
Version: v0.0.1
License: MIT
*/

const fs = require('fs');
const path = require('path');

class I18n {
    /**
     * @param {string|fs.PathLike} localesPath - Mettre le chemin du dossier par `path.join` ou par `string`
     */
    constructor(localesPath) {
        this.translations = {};
        this.currentLocale = {
            lang: 'en',
            region: 'us'
        };
        this.fallbackLocale = {
            lang: 'en',
            region: 'us'
        };
        this.localesPath = localesPath || path.join(__dirname, '..', 'locales');
    }

    init() {
        if (!fs.existsSync(this.localesPath)) {
            fs.mkdirSync(this.localesPath, { recursive: true });
        }

        for (const lang of ['en', 'fr']) {
            this.translations[lang] = {};
            const langPath = path.join(this.localesPath, lang);
            
            if (!fs.existsSync(langPath)) continue;

            for (const region of fs.readdirSync(langPath)) {
                const regionPath = path.join(langPath, region);
                if (!fs.statSync(regionPath).isDirectory()) continue;

                this.translations[lang][region] = {
                    ui: {},
                    window: {},
                    console: {},
                    commands: {}
                };

                ['UI', 'Window', 'Console'].forEach(file => {
                    const filePath = path.join(regionPath, `${file}.json`);
                    if (fs.existsSync(filePath)) {
                        this.translations[lang][region][file.toLowerCase()] = 
                            JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    }
                });

                const cmdsPath = path.join(regionPath, 'CMDs');
                if (fs.existsSync(cmdsPath)) {
                    fs.readdirSync(cmdsPath)
                        .filter(file => file.endsWith('.json'))
                        .forEach(file => {
                            const cmdName = path.basename(file, '.json');
                            const cmdTranslations = JSON.parse(
                                fs.readFileSync(path.join(cmdsPath, file), 'utf8')
                            );
                            this.translations[lang][region].commands[cmdName] = cmdTranslations;
                        });
                }
            }
        }
    }

    setLocale(lang, region) {
        if (this.translations[lang]?.[region]) {
            this.currentLocale = { lang, region };
            return true;
        }
        return false;
    }

    /**
     * @param {string} key
     * @param {ObjectConstructor} params
     */
    t(key, params = {}) {
        const [category, ...subKeys] = key.split('.');
        const { lang, region } = this.currentLocale;
        
        let text = this.translations[lang]?.[region]?.[category];
        for (const k of subKeys) {
            if (!text?.[k]) {
                const fallback = this.translations[this.fallbackLocale.lang]?.[this.fallbackLocale.region]?.[category];
                text = subKeys.reduce((obj, key) => obj?.[key], fallback);
                break;
            }
            text = text[k];
        }

        return text 
            ? text.replace(/\{(\w+)\}/g, (_, param) => params[param] || `{${param}}`)
            : key;
    }

    /**
     * @param {string} lang 
     * @param {string} region 
     * @param {string} category 
     * @param {string} key 
     * @param {string} translation 
     */
    addTranslation(lang, region, category, key, translation) {
        if (!this.translations[lang]) this.translations[lang] = {};
        if (!this.translations[lang][region]) this.translations[lang][region] = {};
        if (!this.translations[lang][region][category]) this.translations[lang][region][category] = {};

        const keys = key.split('.');
        let current = this.translations[lang][region][category];
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = translation;
    }
}

module.exports = I18n;
