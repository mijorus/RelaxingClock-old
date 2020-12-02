import $                 from 'jquery';
import { getUrlVars }    from "../../utils/js/utils";
import { login }         from "./spotifyAuth";

//Extract params from the hashedURL into the params array
export const params = getUrlVars(),
spotifyPlaceholder  = $('#spotify-placeholder'),
musicBox            = $('#music-box');

$(function() {
    //Attempts the login
    login();
})