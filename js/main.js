document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.querySelector('.desktop');
    let openWindows = 0;
    let highestZIndex = 1;

    const icons = [
        {
            name: 'README',
            icon: 'https://win98icons.alexmeub.com/icons/png/notepad-0.png',
            url: 'projects/readme.html'
        },
        {
            name: 'Balatro Like Game',
            icon: 'https://win98icons.alexmeub.com/icons/png/game_solitaire-0.png',
            url: 'projects/balatro-like-game/index.html'
        },
        {
            name: 'Datascape',
            icon: 'https://win98icons.alexmeub.com/icons/png/netshow-1.png',
            url: 'projects/datascape.html'
        },
        {
            name: 'Depressing Adventure',
            icon: 'https://win98icons.alexmeub.com/icons/png/help_book_computer-1.png',
            url: 'projects/depressing_adventure.html'
        },
        {
            name: 'Flesh Syzygy',
            icon: 'https://win98icons.alexmeub.com/icons/png/ole2-1.png',
            url: 'projects/flesh-syzygy/index.html',
            width: '800px',
            height: '600px'
        },
        {
            name: 'Synaptic Decay',
            icon: 'https://win98icons.alexmeub.com/icons/png/monitor_tweakui-0.png',
            url: 'projects/synaptic-decay/index.html',
            width: '800px',
            height: '600px'
        }
    ];

    function createWindow(title, contentUrl, width = '640px', height = '480px') {
        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.style.width = width;
        windowElement.style.height = height;
        windowElement.style.position = 'absolute';
        windowElement.style.top = `${50 + (openWindows * 30)}px`;
        windowElement.style.left = `${50 + (openWindows * 30)}px`;
        windowElement.style.zIndex = highestZIndex++;
        openWindows++;

        windowElement.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">${title}</div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div class="window-body">
                <iframe src="${contentUrl}" style="width: 100%; height: 100%; border: 0;"></iframe>
            </div>
        `;

        desktop.appendChild(windowElement);

        windowElement.addEventListener('mousedown', () => {
            windowElement.style.zIndex = highestZIndex++;
        });

        // Make window draggable
        const titleBar = windowElement.querySelector('.title-bar');
        let isDragging = false;
        let offsetX, offsetY;

        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Window controls
        const closeButton = windowElement.querySelector('[aria-label="Close"]');
        closeButton.addEventListener('click', () => {
            desktop.removeChild(windowElement);
            openWindows--;
        });
    }

    function createIcon(iconData, index) {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon';
        iconElement.style.top = `${20 + (index * 90)}px`;
        iconElement.style.left = '20px';
        iconElement.innerHTML = `
            <img src="${iconData.icon}" alt="${iconData.name}">
            <span>${iconData.name}</span>
        `;
        iconElement.addEventListener('dblclick', () => {
            createWindow(iconData.name, iconData.url, iconData.width, iconData.height);
        });
        desktop.appendChild(iconElement);
    }

    icons.forEach((icon, index) => {
        createIcon(icon, index);
    });
});
