import { getElementDetails } from "./elementDetails";
import { listContainer }     from "./playlistLoader";

/**
 * 
 Creates a list item in the playlist list and returns the item.
 */

export function playlistItemHTML(playlist, playOnClick = true, needsDetails = true) {
    const details = (needsDetails) ? getElementDetails(playlist) : playlist;
    if (details !== null) {
        const item = $(`<li></li>`).addClass(`settings-text playlist list-item ${playOnClick ? 'pointer' : ''}`)
            .append(`<div class="details skinny no-overflow">
                    <span><img class="playlist-icon flex-center" src="${details.img.url}" alt="${details.name} cover"></span>
                    <span class="name no-overflow">${details.name || ''}</span>
                </div>`)
            .data('playlist', details)
            .appendTo($(listContainer))

        return $(item)
    } else {
        return null;
    }
}

/**
 * 
 * @param {String} type 
 */
export function listTypeHTML(type, pointer) {
    const item = $(`<li>[${type}]</li>`)
        .addClass(`list-type list-item settings-text ${pointer ? 'pointer' : ''}`)
        .appendTo($(listContainer));

    return $(item);
}

export function addPlayingAnimation(target) {
    $(listContainer).find('.current-playing-track').remove();
    const playingAnimation = `
        <span class="loader-container current-playing-track">
            <div class="loader line-scale-party"></div>
        </span>`;

    $(target).find('.details').append(playingAnimation)
        .find('.loader').loaders()
}