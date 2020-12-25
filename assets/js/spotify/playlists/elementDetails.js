/**
 * 
 * @param {Object} el 
 * Gets an object from a query to Spotify,
 * returns an object with all the data to attach to the list
 * item, or null if the type is not supported
 */
export function getElementDetails(el) {
    let type = (el.show) ? el.show.type : el.type;
    let element = {};

    if (type === 'show') {
        data = el.show || el
        element = { ...data };
        element.type = 'podcast'
    } else if (type === 'track') {
        element = { ...el };
        element.images = loadAlbumImages(el.album.images);
    } else if (type === 'episode') {
        element = { ...el };
        element.name = `[${el.release_date || ''}] ${el.name}`
    } else if (type === 'album' || type === 'playlist') {
        element = { ...el };
    } else if (type === 'context') {
        element = { 
            name: el.context.metadata.context_description || el.track_window.current_track.name,
            images: loadAlbumImages(el.track_window.current_track.album.images),
            type: 'track',
            uri: (el.context.uri) ? el.context.uri : el.track_window.current_track.uri,
            id: el.track_window.current_track.id,
        }
    } else {
        return null;
    }

    return prepareListItem(element.name, element.images, type, element.uri, element.id);
}

/**
 * 
 * @param {String} name 
 * @param {Array} images 
 * @param {String} type
 * @param {String} uri
 * @param {String} id
 * 
 * @return {Object} list item
 */
export function prepareListItem(name, images = [], type, uri, id) {
    return {
        name: name || '',
        img: images[1] || images[0] || '',
        type: type || '',
        uri: uri || '',
        id: id || ''
    }
}

function loadAlbumImages(albumImages) {
    let images = []
    for (image of albumImages) {
        images.push(image)
    }

    return images;
}