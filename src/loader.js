const base = document.createElement('div');
base.classList.add('loader-base-container');
document.body.appendChild(base);

const logo = document.createElement('img');
logo.src = 'https://termi-hub-app.github.io/assets/logo.png';
logo.classList.add('loader-logo');
base.appendChild(logo);

const loader = document.createElement('div');
loader.classList.add('loader');
base.appendChild(loader);

const text = document.createElement('p');
text.classList.add('loader-text');
text.innerText = 'Loading...';


setTimeout(() => {
    document.body.innerHTML = `    <div id="terminal"></div>
    <div class="input-container">
        <input type="text" id="input" autofocus />
    </div>`;
}, 740);