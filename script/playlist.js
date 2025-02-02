const accessToken = window.location.href.split("access_token=")[1];

const API_URL_SEVERAL_TRACKS = "https://api.spotify.com/v1/tracks";
const API_URL_USER_PLAYLISTS = "https://api.spotify.com/v1/users";

//definim variables global per guardar el token i el ID de llista
let token = accessToken;
let idUser = "";
let selectedPlayList = "";

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

//funcio des de spotify.js
// funcio per eliminar una cançó del localStorage (mitjançant cadena separada per ;)
function removeLocalStorageId(trackId) {
    // Obtenim les cançons actuals al LocalStorage
    let cancons = localStorage.getItem("cancons");
    
    // Si no hi ha cap cançó desada, no fem res
    if (!cancons) {
        alert("No hi ha cançons a eliminar.");
        return;
    }
    
    // Convertim la cadena en un array mitjançant la separació per ";"
    let canconsArray = cancons.split(";");
    
    // Filtrar el trackId que volem eliminar
    canconsArray = canconsArray.filter(id => id !== trackId);
    
    // Actualitzem el localStorage amb la nova cadena
    if (canconsArray.length > 0) {
        localStorage.setItem("cancons", canconsArray.join(";"));
    } else {
        localStorage.removeItem("cancons"); // Eliminar el localStorage si no hi ha cap ID
    }

    alert("Cançó eliminada del LocalStorage!");
}


//funció per esborrar una cançó des de la playlist
async function deleteSong(playlistId, trackUri){
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    //confirmem abans d'esborrar la cançó
    const confirmDelete = confirm('Estas segur que vols elibinar la cançó de la playlist?');
    if(!confirmDelete){
        //el usuari no vol esborrar la cançó
        return;
    }
    //en el cas del sí, cridem a l'API per eliminar la cançó
    try{
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tracks: [{ uri: trackUri }], // La URI de la cançó a esborrar
            }),
        }); 
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        //esborrada la cançó tornem a carregar la llista actualitzada
        await getTracksFromPlaylist(playlistId);
            
    } catch (error) {
        console.error("Error al esborrar la cançó:", error);
        alert("No s'ha pogut esborrar la cançó.");
    }
    alert("Cançó eliminada.");
    console.log('Canço esborrada');
}


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
        container.innerHTML = "<p>Playlists</p>";

        //mostrar les playlists com a botons
        data.items.forEach(playlist => {
            const button = document.createElement('button');
            button.textContent = playlist.name;
            button.dataset.playlistId = playlist.id;
            button.classList.add('playlist-button');
            
            //const div = document.createElement('div');
            //div.textContent = playlist.name;
            //div.dataset.playlistId = playlist.id;
            //div.classList.add('playlist-item');

            button.addEventListener('click', function() {
                //assignem el id de llista
                selectedPlayList = playlist.id;
                //al triar una playlist
                console.log(`Playlist seleccionada: ${playlist.name}`);
                //agafem les cansons des de la playlist
                getTracksFromPlaylist(playlist.id);
            });

            container.appendChild(button);
        });

        //fem input per canviar el nom de una llista
        const div = document.createElement('div');
        const input_llista = document.createElement('input');
        input_llista.type = 'text';
        input_llista.placeholder = 'Entra nou nom llista';
        div.appendChild(input_llista);
        //container.appendChild(div);

        //fem el boto SAVE per canviar el nom de una llista
        const btn_save = document.createElement('button');
        btn_save.textContent = 'Save';
        //afegim un esdeveniment al boto
        btn_save.addEventListener('click', function (){
            desarNouNomLlista();
        });
        //afegim el boto al contenidor del input i despres al container
        div.appendChild(btn_save);
        container.appendChild(div);

    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};


//funcio per canviar el nom de una playlist
async function desarNouNomLlista(){
    //avisem si no hi ha cap llista seleccionada
    if (!selectedPlayList) {
        alert("Selecciona una playlist abans de canviar el nom.");
        return;
    }
    //agafem el nou nom de llista des del input
    const nouNom = document.querySelector('input[type="text"]').value.trim();
    //mirem si el input esta buit o no
    if (!nouNom) {
        alert("El nom de la playlist no pot estar buit.");
        return;
    }
    //demanem confirmacio a l'usuari de si realment vol canviar el nom de la llista
    const confirmacio = confirm("Estàs segur que vols modificar el nom de la playlist?");
    if (!confirmacio) {
        return;
    }
    //preparem url per fetch 
    const url = `https://api.spotify.com/v1/playlists/${selectedPlayList}`;
    
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: nouNom
            }),
        });
        //missatge d'error si hi ha un problema amb el paquet de la consulta
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        //avisem que el nom s'ha canviat amb exit
        alert("El nom de la playlist s'ha actualitzat correctament.");
        console.log(`Playlist actualitzada: ${nouNom}`);

        //tornem a carregar les playlists per reflectir el nou nom
        await getPlayListByUser();

    } catch (error) {
        console.error("Error al actualitzar el nom de la playlist:", error);
        alert("No s'ha pogut actualitzar el nom de la playlist.");
    }
    console.log('Llista canviada');
} 


//retornem les cançons de una playlist
const getTracksFromPlaylist = async function (playlistId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

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
        const container = document.getElementById('paraCansons');
        container.innerHTML = "<p>Cançons</p>";

        if (data.items.length === 0) {
            container.innerHTML += "<p>No hi ha cançons en aquesta playlist.</p>";
            return;
        }

        //mostrem per consola el objecte cançons de la playlist
        console.log(data);

        //renderitzar les cançons de la playlist
        data.items.forEach(item => {
            const track = item.track;
            //afegim la data de quan va ser afegida la canço a la playlist
            const addedAt = item.added_at;
            //generem el div que contindra la informacio de la canço
            const div = document.createElement('div');
            div.textContent = `${track.name} - ${track.artists[0].name} - ${addedAt}`;
            div.classList.add('track-item');

            //afegim el boto del dins del contenidor de cada canço
            const btn_del = document.createElement('button');
            btn_del.textContent = 'DEL';
            //afegim esdeveniment al boto
            btn_del.addEventListener('click', function (){
                deleteSong(playlistId, track.uri);
            });
            //afegim el boto al contenidor de la canço (div)
            div.appendChild(btn_del);

            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error al obtenir les tracks de la playlist:", error);
    }
};


//afegir canço del localStorage a una playlist
async function afegirCansoPlaylist(entrada){
    //obtenim la canço associada al boto ADD al rebre el click
    const trackId = entrada.target.closest('.track-item').dataset.trackId;
    //si no hi ha cap llista seleccionada: avis 
    if (!selectedPlayList) {
        alert('Has de seleccionar una playlist');
        return;
    }
    //demanem confirmacio al usuari
    const confirmAdd = confirm('Vols afegir aquesta cançó a la playlist?');
    if (!confirmAdd) {
        return;
    }

    //construim la url de la canço
    const trackUri = `spotify:track:${trackId}`;
    
    const url = `https://api.spotify.com/v1/playlists/${selectedPlayList}/tracks`;

    //per les proves
    console.log(`ID de la playlist seleccionada:${selectedPlayList}`);
    console.log(`ID de la cançó a afegir: ${trackId}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: [trackUri], //afegim la canço a la playlist
            }),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        //un cop afegida, eliminem la canço del localStorage
        removeLocalStorageId(trackId);

        //actualitzem la llista de cançons del localstorage
        getTrackSelected();

        //actualitzem la llista de cançons a la playlist
        await getTracksFromPlaylist(selectedPlayList);

        alert("Cançó afegida a la playlist!");

    } catch (error) {
        console.error("Error en afegir la cançó a la playlist:", error);
        alert("No s'ha pogut afegir la cançó a la playlist.");
    }

    //console.log('cançó afegida');
}


//esborrar canço del localStorage
function esborrarDelStorage(trackId){
    const confirmEsborrar = confirm("Estàs segur que vols eliminar la cançó de la llista de cançons guardades?");
    if(!confirmEsborrar){
        //usuari no vol esborrar la cançó
        return;
    }
    
    //cridem la funcio que ja tenim des de spotify.js per esborrar del localStorage
    removeLocalStorageId(trackId);
    //actualitzem la llista de cançons disponibles al localstorage
    getTrackSelected();

    console.log('la cançó desada sha esborrat');
}


//renderizar cançons desadas al localStorage
const renderTrackSelected = function (tracks) {
    const container = document.getElementById('paraCansosnsTriades');
    container.innerHTML = "<p>Cançons seleccionades</p>"; // netejar el contingut previ

    tracks.forEach(track => {
        const div = document.createElement('div');
        div.textContent = `${track.name} - ${track.artists[0].name}`;
        div.classList.add('track-item');

        //afegim el trackId com a atribut al div
        div.dataset.trackId = track.id;

        //afegim els botons ADD i DEL
        // ADD per afegir la canço a la playlist i 
        // DEL per esborrar una canço des del localStorage
        const btn_add = document.createElement('button');
        btn_add.textContent = 'ADD';
        //afegim esdeveniment al boto ADD
        btn_add.addEventListener('click', afegirCansoPlaylist);
        //afegim boto ADD al contenidor de la canço
        div.appendChild(btn_add);

        btn_del_storage = document.createElement('button');
        btn_del_storage.textContent = 'DEL';
        //afegim esdeveniment al boto quan rebi el click
        btn_del_storage.addEventListener('click', function(){
            esborrarDelStorage(track.id);
        });
        div.appendChild(btn_del_storage);

        //al final, afegim el div al contenidor
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