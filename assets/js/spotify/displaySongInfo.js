/**
 * 
 * @param {object} info 
 * @param {string} info.trackName
 * @param {string} info.artists
 * @param {string} info.albumName
 * @param {string} info.duration
 * @param {Array}  info.images
 */
const defaultInfos = {
    trackName: $('#song-det-title').text(),
    artists: $('#song-det-artist').text(),
    albumName: $('#song-det-album').text(),
    duration: $('#song-det-durat').text(),
    images: null,
}

export function displaySongInfo(info) {
    if (info) {
        setSongInfos(info);
    } else {
        setSongInfos(defaultInfos);
    }
}

function setSongInfos(info) {
    const duration = moment.duration(info.duration, 'milliseconds')

    $('#song-det-title').text(info.trackName);
    $('#song-det-artist').text(info.artists);
    $('#song-det-album').text(info.albumName);
    $('#song-det-durat').text(duration.format('mm:ss'));
    $('#song-info-thumb').css('background-image', getAlbumImage(info.images));
}

function getAlbumImage(images) {
    if (images !== null) {
        return `url(${images[2].url || images[1].url || images[0].url})`;
    } else {
        return 'none'
    }
}