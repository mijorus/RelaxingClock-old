import { player }                from "./player";
import { playbackIcon }          from "./playerListeners";
import { musicBox }              from "./init";
import { handleLoader }          from "../utils/utils";
import { updatePlaceholderText, 
        updateStatusText }       from "../utils/playerUtils";
import { redirectURI, 
        generateUrl }            from "../utils/generateSpotifyUrl";
import { logout }                from "./auth";
import { startPeriodicDeviceCheck } from "./reconnect";

export const spotifyError = {
     throwTokenError: function() {
        this.removeLoader();
        updateStatusText(`Sorry, but you need to login again`);
        updatePlaceholderText(
            `Please <button id="toker-err-msg" class="transp-btn">login</button> again`,
            true);
        $('#toker-err-msg').on('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();

            logout(false);
            url = await generateUrl();
            window.location.replace(url);
        });
    },

    //Logs an error to the console
     logError: function(message, error, throwError = true) {
        console.error(`${message}`);
        const responseError = error.responseJSON.error.message || error.message || error;
        console.error(responseError);
        if (throwError) this.throwGenericError();
    },

    throwPremiumError: function(username) {
        this.removeLoader();
        localStorage.setItem('premium', 'false');
        updateStatusText(`Sorry ${username}, but you need a premium account`);
        updatePlaceholderText(`Sorry, you must be <br>a premium user :(`, true);
    },

    removeLoader: function(remove = true) {
        if (remove) {
            $(playbackIcon).removeClass('hide');
            handleLoader($('#spotify-loader'), false, null);
        } else {
            $(playbackIcon).addClass('hide');
            handleLoader($('#spotify-loader'), true, null);
        }
    },

    throwGenericError: function(message = 'default') {
        player.disconnect();
        this.removeLoader();
        $(musicBox).addClass('error');
        startPeriodicDeviceCheck(false);

        if (message === 'default') {
            localStorage.removeItem('defaultPlaylist');
            updatePlaceholderText(`Something went<br>wrong :( <a href="${redirectURI}">Try again</a>`, true);
        } else {
            updatePlaceholderText(message, true);
        }
    },
}