export const defaultPlaylistsArray = ['4ZTZhFPPyRzpfHZsWEXAW9', '0TzqTITIxxtgSK4pyNDoOV'];

export function defaultPlaylist(uri = undefined) {
    if (uri === undefined) {
        return localStorage.getItem('defaultPlaylist') || defaultPlaylistsArray[0];
    } else {
        console.log('Saving selected playlist as default');
        localStorage.setItem('defaultPlaylist', uri);
    }
}