const path = require('path');
const fs = require('fs');
const toml = require('toml');

export class Settings {
    constructor(settingfile) {
        this.file = settingfile;
        this.DATA = {
            general: {
                update_channel: "all",
                startup_check: true
            },
            interface: {
                theme: "default",
                language: ["en", "US"]
            },
            history: {
                max_history: 1000,
                save_history: true
            }
        };
    }

    async load() {
        try {
            if (!fs.existsSync(this.file)) {
                await this.export();
                return this.DATA;
            }

            const content = await fs.readFileSync(this.file, 'utf-8');
            this.DATA = toml.parse(content);
            return this.DATA;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.DATA;
        }
    }
    async init(_dat) {

    }

    async set(entry, value) {
        try {
            const [category, key] = entry;
            if (!this.DATA[category]) {
                this.DATA[category] = {};
            }
            
            this.DATA[category][key] = value;
            await this.export();
            return true;
        } catch (error) {
            console.error('Failed to set setting:', error);
            return false;
        }
    }

    async export(targetFile = this.file) {
        try {
            const content = Object.entries(this.DATA)
                .map(([category, values]) => {
                    const section = `[${category}]\n`;
                    const settings = Object.entries(values)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return `${key} = [${value.map(v => `"${v}"`).join(', ')}]`;
                            }
                            return `${key} = ${typeof value === 'string' ? `"${value}"` : value}`;
                        })
                        .join('\n');
                    return section + settings;
                })
                .join('\n\n');

            await fs.writeFileSync(targetFile, content, 'utf-8');
            return true;
        } catch (error) {
            console.error('Failed to export settings:', error);
            return false;
        }
    }
    async import(sourceFile) {
        try {
            if (!fs.existsSync(sourceFile)) {
                throw new Error('Source file does not exist');
            }

            const content = await fs.readFileSync(sourceFile, 'utf-8');
            const importedData = toml.parse(content);

            Object.keys(this.DATA).forEach(category => {
                if (importedData[category]) {
                    Object.keys(this.DATA[category]).forEach(key => {
                        if (typeof importedData[category][key] === typeof this.DATA[category][key]) {
                            this.DATA[category][key] = importedData[category][key];
                        }
                    });
                }
            });

            await this.export();
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    get(category, key) {
        return this.DATA[category]?.[key];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const SETTINGS = new Settings(path.join(__dirname, '..', '..', 'STORAGE', 'settings.toml'));

    await SETTINGS.load();
    const _data = SETTINGS.DATA;

    SETTINGS.init(_data);
});
