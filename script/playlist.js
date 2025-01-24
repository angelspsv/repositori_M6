const accessToken = window.location.href.split("access_token=")[1];

const API_URL_SEVERAL_TRACKS = "https://api.spotify.com/v1/tracks";
const API_URL_USER_PLAYLISTS = "https://api.spotify.com/v1/users";

//A la pàgina de la playlist defi nir una variable global per guardar el token
let token = accessToken;
let idUser = "";


//funcio per retornar el usuari a la pagina de inici
function tornarInici(){
    window.location.href = "index.html";
    console.log('Tornem enrere nomes de prova');
}


//faig el boto Tornar de la pagina playlist.html
const btnReturn = document.createElement('button');
//afegim text al boto
btnReturn.textContent = '<-- Tornar';
//afegir la classe 'button-style' per aplicar els estils definits en el fitxer CSS
btnReturn.classList.add('button-style');
//afegim esdeveniment al boto de tornar a la pagina index
btnReturn.addEventListener('click', tornarInici);
//afegim el boto al espai html creat per aquest
document.getElementById('tornar').appendChild(btnReturn);



//obtenir dades del usuari
const getUser = async function () { 
    const url = "https://api.spotify.com/v1/me"; 
    try { 
        const response = await fetch(url, { 
            method: "GET", 
            headers: { 
                Authorization: `Bearer ${token}`, 
            }, 
        }); 
        if (!response.ok) { 
            throw new Error(`Error ${response.status}: ${response.statusText}`); 
        } 
        const data = await response.json(); 
        if (data) { 
            console.log(data.id);
            idUser = data.id;
        }else { 
            console.log("No hi ha usuari"); 
        } 
    } catch (error) { 
        console.error("Error en obtenir l'usuari:", error); 
    } 
};


//obtenim les playlists del usuari
const getPlayListByUser = async function () {
    const url = `https://api.spotify.com/v1/users/${idUser}/playlists`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const container = document.getElementById('paraPlayList');

        //mostrar les playlists
        data.items.forEach(playlist => {
            const div = document.createElement('div');
            div.textContent = playlist.name;
            div.dataset.playlistId = playlist.id;
            div.classList.add('playlist-item');

            div.addEventListener('click', () => {
                //al triar una playlist
                console.log(`Playlist seleccionada: ${playlist.name}`);
            });

            container.appendChild(div);
        });

    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};


//renderizar cançons desadas
const renderTrackSelected = function (tracks) {
    const container = document.getElementById('paraCansosnsTriades');
    container.innerHTML = "<p>Cançons seleccionades</p>"; // netejar el contingut previ

    tracks.forEach(track => {
        const div = document.createElement('div');
        div.textContent = `${track.name} - ${track.artists[0].name}`;
        div.classList.add('track-item');
        container.appendChild(div);
    });
};


//obtenir IDs de tracks desats en el localStorage
const getIdTracksLocalStorage = function () {
    const storedTracks = localStorage.getItem('cancons');
    if (!storedTracks || storedTracks.trim() === '') {
        console.log("No hi ha tracks desats en el localStorage");
        return null;
    }
    console.log("Tracks desats al localStorage:", storedTracks);
    return storedTracks; // Retorna directament el valor
};


//obtenir detalls de les cançons des de la API
const getTrack = async function (llistaTracks) {
    const urlEndpoint = `${API_URL_SEVERAL_TRACKS}?ids=${llistaTracks}`;

    try {
        const response = await fetch(urlEndpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw Error("Error al fer la consulta", response.status);
        }

        const data = await response.json();
        renderTrackSelected(data.tracks);
    } catch (error) {
        console.log(error);
    }
};


// retorna les cançons desades al local_storage
const getTrackSelected = function(){
    let llistaTracks = getIdTracksLocalStorage();
    if (!llistaTracks) {
        console.log("No hi ha tracks desats en el localStorage");
        return;
    }
    llistaTracks = llistaTracks.replaceAll(";", ",");
    //veure en la consola
    console.log("Llista tracks a consultar:", llistaTracks); 
    getTrack(llistaTracks);
};


//executem les funcions principals al carregar la pagina playlist.html
(async function () {
    await getUser();
    await getPlayListByUser();
    getTrackSelected();
})();


/*
//retorna la llista de les cançons desades per el usuari
const getPlayList = function(){
    getUser().then(function(){
        getPlayListByUser();
    });

//com son funcions anonimes primer s'han de definir i despres cridar-les
getTrackSelected();
getPlayList();
*/