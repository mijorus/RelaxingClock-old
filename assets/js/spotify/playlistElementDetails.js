export function getElementDetails(el) {
    let type = (el.show) ? el.show.type : el.type;
    let element = {};
    switch (type) {
        case 'show':
            data = el.show || el
            element = { ...data };
            element.type = 'podcast'
            break;

        case 'track':
            element = { ...el };
            let images = []
            for (image of el.album.images) {
                images.push(image)
            }
            element.images = images;
            break;

        case 'episode':
            element = { ...el};
            element.name = `[${el.release_date || ''}] ${el.name}`
            break;

        default:
            element = { ...el };
            break;
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