const path = require('path');
const fs = require('fs');
const { shell, ipcRenderer } = require('electron');
const formatText = require('../utils/HTMLFormater.js');
const _APP = require('../_APPINFO.js');

class TerminalManager {
    constructor() {
        this.terminal = null;
        this.input = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.themes = {};
        this.currentMode = 'default';
        this.isInitialized = false;
        this.welcomeShown = false;
        this.lastCommand = null;
        this.commandInProgress = false;
        
        this.themePath = path.join(__dirname, '..', 'STORAGE', 'themes');
        
        this.logSystem = {
            clear: () => this.terminal.innerHTML = '',
            log: (msg) => this.terminal.innerHTML += formatText(`\n${msg}`),
            error: (msg) => this.write('red', 'ERROR', msg),
            success: (msg) => this.write('green', 'SUCCESS', msg),
            info: (msg) => this.write('blue', 'INFO', msg),
            warn: (msg) => this.write('yellow', 'WARN', msg),
            debug: (msg) => this.write('gray', 'DEBUG', msg)
        };
    }

    write(color, prefix, message) {
        if (!this.terminal) return;
        this.terminal.innerHTML += formatText(`\n%%%${color}%%%[${prefix}] ${message}%%%!${color}%%%`);
        this.scrollToBottom();
    }

    async init() {
        if (this.isInitialized) return;
        
        document.querySelectorAll('*').forEach((value) => {
            value.classList.add('g4Dd0c04QDreDds32q5d0s2sd1cdsf3zegbcd');
        });

        this.terminal = document.getElementById('terminal');
        this.input = document.getElementById('input');
        
        if (!this.terminal || !this.input) return;

        await new Promise(async (resolve, reject) => {
            try {
                await this.setupEventListeners();
                await this.setupThemes();
                 resolve();
            } catch (error) {
                console.error;
                 reject(error);
            }
        });
        
        document.getElementsByClassName('loader-container').item(0).remove();
        this.logSystem.clear();

        await this.showWelcome();

        document.querySelectorAll('*').forEach((value) => {
            value.classList.remove('g4Dd0c04QDreDds32q5d0s2sd1cdsf3zegbcd');
        });
        this.input.focus();
        
        this.isInitialized = true;
    }

    async setupEventListeners() {
        this.input.addEventListener('keydown', this.handleInput.bind(this));
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'terminal-tooltip';
        tooltip.textContent = 'CTRL+Click to open the link';
        document.body.appendChild(tooltip);
        
        let tooltipTimer;
        let isTooltipVisible = false;

        // Handle URL interactions
        this.terminal.addEventListener('mousemove', (e) => {
            const link = e.target.closest('.terminal-link');
            if (link && !e.ctrlKey) {
                clearTimeout(tooltipTimer);
                
                const rect = link.getBoundingClientRect();
                tooltip.style.display = 'block';
                tooltip.classList.remove('fade-out');
                
                // Calculate position
                let x = e.clientX + 15;
                let y = e.clientY + 15;
                
                // Adjust if tooltip would go off screen
                if (x + tooltip.offsetWidth > window.innerWidth) {
                    x = window.innerWidth - tooltip.offsetWidth - 10;
                }
                if (y + tooltip.offsetHeight > window.innerHeight) {
                    y = window.innerHeight - tooltip.offsetHeight - 10;
                }
                
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
                
                // Set timer to hide tooltip after 5 seconds of no movement
                tooltipTimer = setTimeout(() => {
                    tooltip.classList.add('fade-out');
                }, 5000);
                
                isTooltipVisible = true;
            } else if (isTooltipVisible) {
                tooltip.classList.add('fade-out');
                isTooltipVisible = false;
            }

        });

        this.terminal.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        this.terminal.addEventListener('click', (e) => {
            const link = e.target.closest('.terminal-link');
            if (link && e.ctrlKey) {
                const url = link.dataset.url;
                shell.openExternal(url);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (document.activeElement !== this.input && !e.ctrlKey && !e.altKey) {
                this.input.focus();
            }
        });
    }

    handleInput(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            
            const command = this.input.value.trim();
            if (!command || this.commandInProgress) return;
            
            this.commandInProgress = true;
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
            this.executeCommand(command);
            this.input.value = '';
            this.commandInProgress = false;
        } else if (event.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.input.value = '';
                this.historyIndex = this.commandHistory.length;
            }
        }
    }

    executeCommand(command) {
        const [cmd, ...args] = command.split(' ');
        const client = {
            cmdin: { cmd, args },
            console: { clear: () => this.clearTerminal() },
            THEME: { 
                themes: this.themes, 
                currentMode: this.currentMode,
                setTheme: (mode) => this.applyTheme(mode)
            },
            localStorage,
            scrollToBottom: () => this.scrollToBottom()
        };

        try {
            const cmdFiles = fs.readdirSync(path.join(__dirname, '..', 'commands'))
                .filter(file => file.endsWith('.js'));
            
            for (const file of cmdFiles) {
                const module = require(`../commands/${file}`);
                if (module.COMMAND === cmd) {
                    module.execute(client, this.logSystem, this.input, this.terminal, formatText);
                    return;
                }
            }
            
            this.logSystem.error(`Command not found: ${cmd}`);
        } catch (err) {
            this.logSystem.error(err.message);
        }
    }

    async showWelcome() {
        if (this.welcomeShown) return;

        this.terminal.innerHTML += formatText(
            `\n%%%bold%%%Welcome to %%%underline%%%TermiHub %%%italic%%%${_APP.version.important}%%%!italic%%%%%%!underline%%%%%%!bold%%%`
        );
        this.welcomeShown = true;
    }

    clearTerminal() {
        this.logSystem.clear();
    }

    scrollToBottom() {
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    async setupThemes() {
        const defaultThemes = [
            {
                name: "default",
                properties: {
                    "--background-color": "black",
                    color: "white",
                    "--scrollbar-track": "#1b1b1b",
                    "--scrollbar-thumb": "#555",
                    "--input-background": "#333",
                    "--input-color": "white"
                }
            },
            {
                name: "light",
                properties: {
                    "--background-color": "white",
                    color: "black",
                    "--scrollbar-track": "#555",
                    "--scrollbar-thumb": "#1b1b1b",
                    "--input-background": "white",
                    "--input-color": "#333"
                }
            },
            {
                name: "halloween",
                properties: {
                    "--background-color": "#1a1a1a",
                    color: "#ff7518",
                    "--scrollbar-track": "#2c2c2c",
                    "--scrollbar-thumb": "#ff7518",
                    "--input-background": "#333",
                    "--input-color": "white"
                }
            }
        ];

        try {
            // Ensure theme directory exists
            fs.mkdirSync(this.themePath, { recursive: true });
            
            // First load default themes
            defaultThemes.forEach(theme => {
                const themeFile = path.join(this.themePath,  `${theme.name}.json`);
                this.themes[theme.name] = theme.properties;
                
                // Save default theme if it doesn't exist
                if (!fs.existsSync(themeFile)) {
                    fs.writeFileSync(themeFile, JSON.stringify(theme, null, 2));
                }
            });

            // Then load any custom themes from STORAGE
            const themeFiles = fs.readdirSync(this.themePath);
            themeFiles.forEach(file => {
                if (!file.endsWith('.json')) return;
                const themeName = path.basename(file, '.json');
                // Skip if it's a default theme
                if (defaultThemes.some(dt => dt.name === themeName)) return;
                
                const themeData = JSON.parse(fs.readFileSync(path.join(this.themePath, file), 'utf8'));
                if (themeData.properties) {
                    this.themes[themeName] = themeData.properties;
                }
            });

            // Apply theme
            this.currentMode = localStorage.getItem('themeMode') || 'default';
            this.applyTheme(this.currentMode);
        } catch (err) {
            console.error('Failed to setup themes:', err);
        }
    }

    applyTheme(mode) {
        const theme = this.themes[mode];
        if (theme) {
            Object.entries(theme).forEach(([prop, value]) => {
                document.documentElement.style.setProperty(prop, value);
            });
        }
    }
}

// Initialize on DOM ready
const terminal = new TerminalManager();
document.addEventListener('DOMContentLoaded', () => terminal.init(), { once: true });
