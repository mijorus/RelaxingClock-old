/**
 * 
 * @param {object} info 
 * @param {string} info.trackName
 * @param {string} info.artists
 * @param {string} info.albumName
 * @param {string} info.duration
 * @param {Array}  info.images
 */
export function displaySongInfo(info) {
    const duration = moment.duration(info.duration, 'milliseconds')

    $('#song-det-title').text(info.trackName);
    $('#song-det-artist').text(info.artists);
    $('#song-det-album').text(info.albumName);
    $('#song-det-durat').text(duration.format('mm:ss'));
    $('#song-info-thumb').css({
        'background-image': `url(${info.images[2].url || info.images[1].url || info.images[0].url})`
    });
}