import { login }         from "./auth";

//Extract params from the hashedURL into the params array
export const spotifyPlaceholder  = $('#spotify-placeholder'),
musicBox                         = $('#music-box');

export function initSpotifyAuthProcess() {
    //Attempts the login
    login();
}