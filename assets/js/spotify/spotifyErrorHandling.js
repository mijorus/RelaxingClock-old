export spotifyError = {
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
        console.error(error);
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

        if (message === 'default') {
            updatePlaceholderText(
                `Something went<br>wrong :( <a href="${redirectURI}">Try again</a>`, true);
        } else {
            updatePlaceholderText(message, true);
        }
    },
}