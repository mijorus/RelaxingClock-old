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