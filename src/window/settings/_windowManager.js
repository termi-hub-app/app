//const { ipcRenderer } = require('electron');
//
class TitlebarManager {
    constructor() {
        this.IDIDID = document.querySelector('identifier#WINTYPEIDENTIFIER_researchString').innerHTML;
        this.setupToolbar();
        this.setupWindowControls();
    }

    setupWindowControls() {
        const minimizeBtn = document.getElementById('minimize-button');
        const closeBtn = document.getElementById('close-button');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.IPCRender('window-minimize'));
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.IPCRender('window-close'));
        }
    }

    setupToolbar() {
        const toolbarItems = {
            'File': [
                { 
                    label: 'Save settings in a file', 
                    action: () => ipcRenderer.send('save-settings') 
                },
                { 
                    label: 'Import settings from a file', 
                    action: () => ipcRenderer.send('import-settings') 
                }
            ],
            'Theme': [
                { 
                    label: 'Import a theme configuration', 
                    action: () => ipcRenderer.send('import-theme') 
                },
                { 
                    label: 'Export a theme', 
                    action: () => ipcRenderer.send('export-theme') 
                }
            ]
        };

        const toolbar = document.querySelector('.titlebar-toolbar');
        if (!toolbar) {
            console.error('Toolbar element not found');
            return;
        }

        toolbar.innerHTML = '';

        Object.entries(toolbarItems).forEach(([menuName, items]) => {
            const menuContainer = document.createElement('div');
            menuContainer.className = 'toolbar-menu-container';

            const button = document.createElement('button');
            button.className = 'toolbar-button';
            button.textContent = menuName;

            const menu = document.createElement('div');
            menu.className = 'toolbar-menu';

            items.forEach(item => {
                const menuItem = document.createElement('button');
                menuItem.className = 'toolbar-menu-item';
                menuItem.textContent = item.label;
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.action();
                    menu.style.display = 'none';
                });
                menu.appendChild(menuItem);
            });

            menuContainer.appendChild(button);
            menuContainer.appendChild(menu);

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const allMenus = document.querySelectorAll('.toolbar-menu');
                allMenus.forEach(m => {
                    if (m !== menu) m.style.display = 'none';
                });
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });

            toolbar.appendChild(menuContainer);
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.toolbar-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        });
    }

    IPCRender(actionId) {
        ipcRenderer.send(`${actionId}-${this.IDIDID}`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const toolbarManager = new TitlebarManager();

    toolbarManager.setupWindowControls();
    toolbarManager.setupToolbar();
});
