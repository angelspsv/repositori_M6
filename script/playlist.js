const accessToken = window.location.href.split("access_token=")[1];

const API_URL_SEVERAL_TRACKS = "https://api.spotify.com/v1/tracks";

//A la pàgina de la playlist defi nir una variable global per guardar el token
let token = "";


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



const renderTrackSelected = function(tracks){

}


//retorna la llista de les cançons desades per el usuari
const getPlayList = function(){

}

const getIdTracksLocalStorage = function(){
    return localStorage.getItem('trackList');
}

const getTrack = async function(llistaTracks){
    const urlEndpoint = `${API_URL_SEVERAL_TRACKS}?ids=${llistaTracks}`;
    try{
        //cridar la api
        const resposta = await fetch(urlEndpoint, {
            "method": GET,
            "headers": {
                Authorization: `Bearer ${accessToken}`,
            }
        });

        if(!resposta.ok){
            throw Error("Error al fer la consulta", resposta.status);
        }

        //consultar la informacio
        const tracks = await resposta.json();

        renderTrackSelected();
    }

    catch (error){
        console.log(error);
    }
}


// retorna les cançons desades al local_storage
const getTrackSelected = function(){
    let llistaTracks = getIdTracksLocalStorage();
    llistaTracks = llistaTracks.replaceAll(";", ",");
    getTrackSelected();
    //get track localstorage
    //cridar el endpoint https api.spotify.com/v1/tracs

}


//com son funcions anonimes primer s'han de definir i despres cridar-les
getPlayList();
getTrackSelected();