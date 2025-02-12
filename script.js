document.getElementById('load-channels').addEventListener('click', function () {
    const iptvLink = document.getElementById('iptv-link').value;
    if (iptvLink) {
        loadChannels(iptvLink);
    } else {
        alert('Por favor, ingresa un enlace válido.');
    }
});

// Función para cargar los canales
function loadChannels(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const channels = parseM3U(data);
            displayChannels(channels);
            enableSearch(channels); // Habilitar el buscador
        })
        .catch(error => {
            console.error('Error al cargar la lista de canales:', error);
            alert('Error al cargar la lista de canales. Por favor, verifica el enlace.');
        });
}

// Función para parsear la lista M3U
function parseM3U(data) {
    const lines = data.split('\n');
    const channels = [];
    let currentChannel = {};

    lines.forEach(line => {
        if (line.startsWith('#EXTINF:')) {
            const info = line.split(',');
            currentChannel.name = info[1].trim();
        } else if (line.startsWith('http')) {
            currentChannel.url = line.trim();
            channels.push(currentChannel);
            currentChannel = {};
        }
    });

    return channels;
}

// Función para mostrar los canales en la lista
function displayChannels(channels) {
    const channelList = document.getElementById('channel-list');
    channelList.innerHTML = '';

    channels.forEach(channel => {
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.textContent = channel.name;
        channelItem.addEventListener('click', () => playChannel(channel.url));
        channelList.appendChild(channelItem);
    });
}

// Función para habilitar el buscador
function enableSearch(channels) {
    const searchInput = document.getElementById('search-channel');
    searchInput.disabled = false;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const filteredChannels = channels.filter(channel =>
            channel.name.toLowerCase().includes(searchTerm)
        );
        displayChannels(filteredChannels);
    });
}

// Función para reproducir un canal
function playChannel(url) {
    const videoPlayer = document.getElementById('video-player');
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/' + url; // Usa un proxy CORS

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(proxyUrl);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
        });
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = proxyUrl;
        videoPlayer.play();
    } else {
        alert('Tu navegador no soporta la reproducción de este stream.');
    }
}
