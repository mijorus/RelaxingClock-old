import { updatePlaceholderText, updateSpotifyIcon } from "js/utils/playerUtils";
import { spotifyPlaceholder } from "./init";
import { deviceID } from "./playerListeners";
import { findDevices } from "./requests";

export function reconnect(play = false) {
    updatePlaceholderText('Reconnecting <br> to Spotify...', true);
    spotify.removeLoader(false);
    playerIsReady = false;

    let lastSong;
    //const context = currentStateContext.uri;
    /* We will test the context uri against this regex
    to see if is it a valid uris recognised but the 
    web API, if the context is not recognised (for ex 
    the user's favourite playlist) it will just play the last track*/
    const validContext = /:artist|:album|:playlist/;
    if (validContext.test(context)) {
        lastSong = {
            'context_uri': context,
            'offset': { 'uri': currentTrack.uri },
        }
    } else {
        lastSong = { 'uris': [currentTrack.uri] };
    }

    spotify.findDevices()
        .done(function (response) {
            console.log(response);
            for (device of response.devices) {
                if (device.id !== deviceID && device.is_active) {
                    spotify.removeLoader(true);
                    updatePlaceholderText(`${device.name}`, false);
                    $(spotifyIcon).removeClass('has-cover').css('background-image', 'none');
                    playIcon(true);
                }
            }
        })
        .fail(function (error) {
            spotify.logError('CANNOT GET DEVICES LIST', error);
        });
}

var deviceCheckInterval;
export function startPeriodicDeviceCheck(start = true) {
    if (start && deviceID) {
        periodicDeviceCheck(deviceID);
    } else {
        clearInterval(deviceCheckInterval);
    }
}

function periodicDeviceCheck(localDeviceID) {
    deviceCheckInterval = setInterval(() => {
        findDevices()
            .done((res) => {
                const activeDevice = res.devices.find((device) => {
                    return device.is_active === true;
                })
            
                if (activeDevice && localDeviceID !== activeDevice.id) {
                    console.warn('User is currently playing on a different device');

                    updateSpotifyIcon(getDeviceIcon(activeDevice.type), 'icon');
                    if (activeDevice.name) updatePlaceholderText(`${activeDevice.name}`, false, false);
                }
            })
    }, 15 * 1000)
}

function getDeviceIcon(type) {
    switch (type) {
        case 'Computer':
            return 'lnr lnr-laptop';

        case 'Smartphone': 
            return 'fas fa-mobile-alt';

        case 'TV':
            return 'lnr lnr-screen';

        default:
            return 'lnr lnr-laptop-phone'; 
    }
}