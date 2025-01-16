import { clientId, clientSecret } from "../env/client.js";

//variables globals
//const URL = "https://accounts.spotify.com/authorize";
//const redirectUri = "http://127.0.0.1:5500/playlist.html"; 
//const scopes = "playlist-modify-private user-library-modify playlist-modify-public";

//aqui guardem el token
let accessToken;

//aqui es veuran les cançons
const espaiCansonsData = document.getElementById('esquerra_centre');

//aqui es veuran les dades de l'artista
const espaiArtistaData = document.getElementById('artista');

//aqui es veuran les tres cansons del grup
const espaiTopTres = document.getElementById("song_list");

//funcio que mostra el text entrat en el input de canço
function cercaCansons() {
    const strCerca = inputSong.value;

    if (strCerca.trim() === "") {
        alert("Has d'introduir un nom d'una cançó");
        return;
    } else if (strCerca.trim().length <= 2) {
        alert("Has d'introduir almenys 3 caràcters");
        return;
    }

    searchSpotifyTracks(strCerca, accessToken)
        .then(function(results) {
            console.log("Resultats de la cerca:", results);
            mostraCansons(results);
            // Mostra els resultats aquí
        })
        .catch(function(error) {
            console.error("Error al buscar cançons:", error);
        });
    
}

//Creem estructura html de cansons
function mostraCansons(tracks) {
    // Neteja l'espai de resultats abans d'afegir nous resultats
    espaiCansonsData.innerHTML = "";

    if (!tracks || tracks.length === 0) {
        // Si no hi ha resultats, mostra un missatge
        const noResultats = document.createElement("p");
        noResultats.textContent = "No hi han resultats";
        noResultats.classList.add("no-resultats");
        espaiCansonsData.appendChild(noResultats);
        return;
    }

    // Per cada pista, crea un div amb la informació corresponent
    tracks.forEach(function(track) {
        const trackDiv = document.createElement("div");
        trackDiv.classList.add("track-result");

        // Imatge de la portada
        const img = document.createElement("img");
        img.src = track.album.images[0]?.url || "placeholder-image-url.jpg";
        img.alt = track.name;
        img.classList.add("track-image");
        img.addEventListener('click', function(){mostraArtista(track.artists[0]?.id)});

        // Nom de la cançó
        const nomCanso = document.createElement("h3");
        nomCanso.textContent = `Cançó: ${track.name}`;
        nomCanso.classList.add("track-name");
        nomCanso.addEventListener('click', function(){mostraArtista(track.artists[0]?.id)});

        // Artista
        const artista = document.createElement("p");
        artista.textContent = `Artista: ${track.artists[0]?.name || "Desconegut"}`;
        artista.classList.add("track-artist");
        artista.addEventListener('click', function(){mostraArtista(track.artists[0]?.id)});

        // album
        const album = document.createElement("p");
        album.textContent = `Àlbum: ${track.album.name}`;
        album.classList.add("track-album");
        album.addEventListener('click', function(){mostraArtista(track.artists[0]?.id)});

        // ID de la cançó
        const idCanso = document.createElement("p");
        idCanso.textContent = `ID Cançó: ${track.id}`;
        idCanso.classList.add("track-id");
        idCanso.addEventListener('click', function(){mostraArtista(track.artists[0]?.id)});

        // ID de l'artista
        const idArtista = document.createElement("p");
        idArtista.textContent = `ID Artista: ${track.artists[0]?.id || "Desconegut"}`;
        idArtista.classList.add("artist-id");
        idArtista.addEventListener('click', function(){mostraArtista(track.artists[0]?.id)});

        // boto afegir canso
        const btnMostrarArtista = document.createElement("button");
        //funcions addLocalStorageId i removeLocalStorageId
        //funcio comprovar si local storage conte id
        if(checkIfIdExists(track.id)){//si local storage conte track.id
            btnMostrarArtista.textContent = "- Eliminar canço";
            btnMostrarArtista.classList.add("btn-add-canso");
            btnMostrarArtista.addEventListener('click', function() {
                removeLocalStorageId(track.id);
            });
        }else{//si local storage no conte track.id
            btnMostrarArtista.textContent = "+ Afegir cançó";
            btnMostrarArtista.classList.add("btn-add-canso");
            btnMostrarArtista.addEventListener('click', function() {
                addLocalStorageId(track.id);
            });
        }

        // afegim tots els elements al div de la pista
        trackDiv.appendChild(img);
        trackDiv.appendChild(nomCanso);
        trackDiv.appendChild(artista);
        trackDiv.appendChild(album);
        trackDiv.appendChild(idCanso);
        trackDiv.appendChild(idArtista);
        trackDiv.appendChild(btnMostrarArtista);

        // afegim el div de la pista al contenidor principal
        espaiCansonsData.appendChild(trackDiv);
    });
}

//Cridem a API spotify per recollir dades artista i top 3
function mostraArtista(artistaId){
    // Cridem a API spotify per recollir info artista
    fetch(`https://api.spotify.com/v1/artists/${artistaId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    })
    .then(function(response) {
        if (!response.ok) { //Control errors
            throw new Error(`Error al obtenir la informació de l'artista: ${response.statusText}`);
        }
        return response.json();
    })
    .then(function(artistData){
        // Mostrar la informacio de l'artista
        mostraInfoDeLArtista(artistData);

        // Un cop tinguem la informacio de l'artista, cridem GET TOP TRACKS per obtenir les 3 cançons mes populars
        fetch(`https://api.spotify.com/v1/artists/${artistaId}/top-tracks`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error(`Error al obtenir les cançons més populars: ${response.statusText}`);
            }
            return response.json();
        })
        .then(function(topTracksData) {
            // Mostrar les 3 cançons més populars
            mostrarTopTracks(topTracksData.tracks);
        })
        .catch(function(error) {
            console.error(error);
        });
    })
    .catch(function(error) {
        console.error(error);
    });
}

//Creeem estructura html info artisata
function mostraInfoDeLArtista(artistData) {
    const infoArtistaDiv = document.createElement("div");
    infoArtistaDiv.classList.add("artist-info");

    // Imatge de l'artista
    const img = document.createElement("img");
    img.src = artistData.images[0]?.url;
    img.alt = artistData.name;
    img.classList.add("artist-image");

    // Nom de l'artista
    const nomArtista = document.createElement("h3");
    nomArtista.textContent = `Nom de l'artista: ${artistData.name}`;
    nomArtista.classList.add("artist-name");

    // Popularitat de l'artista
    const popularitat = document.createElement("p");
    popularitat.textContent = `Popularitat: ${artistData.popularity}`;
    popularitat.classList.add("artist-popularity");

    // Gèneres de l'artista
    const generes = document.createElement("p");
    generes.textContent = `Gèneres: ${artistData.genres.join(", ")}`;
    generes.classList.add("artist-genres");

    // Seguidors de l'artista
    const seguidors = document.createElement("p");
    seguidors.textContent = `Seguidors: ${artistData.followers.total}`;
    seguidors.classList.add("artist-followers");

    // Afegir tota la informació al div de l'artista
    infoArtistaDiv.appendChild(img);
    infoArtistaDiv.appendChild(nomArtista);
    infoArtistaDiv.appendChild(popularitat);
    infoArtistaDiv.appendChild(generes);
    infoArtistaDiv.appendChild(seguidors);

    // Afegir el div al contenidor
    espaiArtistaData.appendChild(infoArtistaDiv);
}

//Creem estructura html Top 3 cansons
function mostrarTopTracks(tracks) {
    // Crear un div per a les cançons més populars
    const topTracksDiv = document.createElement("div");
    topTracksDiv.classList.add("top-tracks");

    const heading = document.createElement("h4");
    heading.textContent = "Les 3 cançons més populars";
    topTracksDiv.appendChild(heading);

    // Crear una llista de les cançons
    const list = document.createElement("ul");

    // Afegir les 3 primeres cançons
    tracks.slice(0, 3).forEach(function(track) {
        const listItem = document.createElement("li");

        const trackName = document.createElement("span");
        trackName.textContent = track.name;
        listItem.appendChild(trackName);

        list.appendChild(listItem);
    });

    topTracksDiv.appendChild(list);

    // Afegir les cançons al contenidor
    espaiTopTres.appendChild(topTracksDiv);
}

//funcio que al ser executada esborra el valor/dades de la cerca previa en els diferents contenidors html 
function esborrarho() {
    inputSong.value = "";
    espaiCansonsData.innerHTML = "";
    espaiArtistaData.innerHTML = "";
    espaiTopTres.innerHTML = "";
}

// funcio per afegir una cançó al localStorage (com una cadena separada per ;) 
function addLocalStorageId(trackId) {
    // Obtenim els IDs de les cançons existents des del localStorage (si n'hi ha)
    let cancons = localStorage.getItem("cancons");
    
    // Si no hi ha cap ID de cançó guardat, inicialitzem una cadena buida
    if (!cancons) {
        cancons = "";
    }
    
    // Si la cançó no està ja en el LocalStorage, la afegim
    if (!cancons.includes(trackId)) {
        // Afegim el ID a la cadena separada per ";"
        if (cancons === "") {
            cancons = trackId;
        } else {
            cancons += `;${trackId}`;
        }
        //desem la cadena actualitzada al LocalStorage
        localStorage.setItem("cancons", cancons);
        alert("Cançó afegida!");
    } else {
        alert("Aquesta cançó ja està a la llista.");
    }
}

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

    alert("Cançó eliminada!");
}

//comprova si id existeix al local storage
function checkIfIdExists(trackId) {
    // Obtenim el valor de les cançons des del localStorage
    let cancons = localStorage.getItem("cancons");
    
    // Si no hi ha cap cançó guardada, retornem false
    if (!cancons) {
        return false;
    }
    
    // Comprovem si el trackId existeix a la cadena separada per ";"
    return cancons.split(";").includes(trackId);
}

const getSpotifyAccessToken = function (clientId, clientSecret) {
    // Url de l'endpont de spotify
    const url = "https://accounts.spotify.com/api/token";
    // ClientId i ClienSecret generat en la plataforma de spotify
    const credentials = btoa(`${clientId}:${clientSecret}`);

    //Es crear un header on se li passa les credencials
    const header = {
        Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded",
    };
    fetch(url, {
        method: "POST",
        headers: header,
        body: "grant_type=client_credentials", // Paràmetres del cos de la sol•licitud
    })
        .then((response) => {
            // Controlar si la petició ha anat bé o hi ha alguna error.
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json(); // Retorna la resposta com JSON
        })
        .then((data) => {
            // Al data retorna el token d'accés que necessitarem 
            accessToken = data.access_token;
            console.log("Access token: " + accessToken);

            //mabilitem els botons Buscar i Borrar quan ja tenim el token
            btnBuscar.disabled = false;
            btnDelete.disabled = false;
        })
        .catch((error) => {
            // SI durant el fetch hi ha hagut algun error arribarem aquí.
            console.error("Error a l'obtenir el token:", error);
        });
};

const searchSpotifyTracks = function (query, accessToken) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`;

    return fetch(searchUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    })
        .then(function(response) {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(function(data) {
            return data.tracks.items; // Retorna només les pistes trobades
        })
        .catch(function(error) {
            console.error("Error al buscar cançons:", error);
            throw error;
        });
};


//funcio per quan fem click al boto playlist
function anarPlayList() {
    console.log('PlayList clicado');
}


//Inicialitzem en llegir el fitxer
//faig el input
const inputSong = document.createElement('input');
inputSong.type = 'text';
//afegir la classe 'input-style' per aplicar els estils definits en el fitxer CSS
inputSong.classList.add('input-style');
inputSong.placeholder = 'Escriu el nom de la canço';
//afegim el element creat al contenidor html creat per aquest
document.getElementById('input_botons').appendChild(inputSong);


//faig el boto per cercar cançons
const btnBuscar = document.createElement('button');
btnBuscar.textContent = 'Buscar';
//afegir la classe 'button-style' per aplicar els estils definits en el fitxer CSS
btnBuscar.classList.add('button-style');
//inicialment deshabilitem el boto
btnBuscar.disabled = true; 
//afegim un esdeveniment al boto per fer alguna cosa quan rebi el click
btnBuscar.addEventListener('click', cercaCansons);
//afegim el boto al element html creat per aquest
document.getElementById('input_botons').appendChild(btnBuscar);


//faig el boto per esborrar-ho tot
const btnDelete = document.createElement('button');
btnDelete.textContent = 'Borrar';
//afegir la classe 'button-style' per aplicar els estils definits en el fitxer CSS
btnDelete.classList.add('button-style');
//inicialment deshabilitem el boto
btnDelete.disabled = true;
//afegim un esdeveniment al fer click al boto per esborrar-ho tot
btnDelete.addEventListener('click', esborrarho);
//afegim el boto al element html creat per aquest
document.getElementById('input_botons').appendChild(btnDelete);


//fem el boto de playlist
const btnPlaylist = document.createElement('button');
//afegim text al boto
btnPlaylist.textContent = 'PlayList';
//afegir la classe 'button-style' per aplicar els estils definits en el fitxer CSS
btnPlaylist.classList.add('button-style');
//afegim esdeveniment al fer click al boto
btnPlaylist.addEventListener('click', anarPlayList);
//afegim el boto al contenidor html creat pel boto
document.getElementById('input_botons').appendChild(btnPlaylist);


getSpotifyAccessToken(clientId, clientSecret);
