//import {clientId, clientSecret} from "../env/client";

//aqui es veuran les cançons
const espaiCansonsData = document.getElementById('esquerra_centre');

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
//afegim un esdeveniment al boto per fer alguna cosa quan rebi el click
btnBuscar.addEventListener('click', mostrarCanso);
//afegim el boto al element html creat per aquest
document.getElementById('input_botons').appendChild(btnBuscar);


//faig el boto per esborrar-ho tot
const btnDelete = document.createElement('button');
btnDelete.textContent = 'Borrar';
//afegir la classe 'button-style' per aplicar els estils definits en el fitxer CSS
btnDelete.classList.add('button-style');
//afegim un esdeveniment al fer click al boto per esborrar-ho tot
btnDelete.addEventListener('click', esborrarho);
//afegim el boto al element html creat per aquest
document.getElementById('input_botons').appendChild(btnDelete);


//funcio que mostra el text entrat en el input de canço
function mostrarCanso(){
    espaiCansonsData.innerHTML = inputSong.value;
}


//funcio que al ser executada esborra el valor de la cerca previa
function esborrarho(){
    inputSong.value = "";
    espaiCansonsData.innerHTML = "";
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
        // Haurem d’habilitar els botons “Buscar” i “Borrar”
        const accessToken = data.access_token;
        console.log("Access token: " + accessToken);
    })
    .catch((error) => {
        // SI durant el fetch hi ha hagut algun error arribarem aquí.
        console.error("Error a l'obtenir el token:", error);
    });
};
    

//getSpotifyAccessToken(clientId, clientSecret);
