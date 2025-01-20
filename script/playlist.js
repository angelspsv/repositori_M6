const accessToken = window.location.href.split("access_token=")[1];

//A la pàgina de la playlist defi nir una variable global per guardar el token
let token = "";


//funcio per retornar el usuari a la pagina de inici
function tornarInici(){
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