import { getPlaylistData,
        getShowList,
        getPlaylistList,
        play,
        search,
        getShowEpisodes }    from "./requests";
import { removeSpace,
        handleLoader }       from "../utils/utils";

import { defaultPlaylist }   from "./player";
import { deviceID}           from "./playerListeners";
import { getElementDetails } from "./playlistElementDetails";

var userLibrary = [],
defaultLibrary = [],
userSelection = undefined,
listContainer;
export function playlistLoader(container) {
    listContainer = container;
    if (userLibrary.length === 0 || defaultLibrary.length === 0) {
        $.when(getPlaylistList(), getShowList(), getPlaylistData(defaultPlaylist[0]), getPlaylistData(defaultPlaylist[1]))
            .done((playlists, shows, default1, default2) => {
                userLibrary.push(playlists[0].items, shows[0].items);
                defaultLibrary.push(default1[0], default2[0]);
                loadUserList(userLibrary);
            })
    } else {
        loadUserList(userLibrary);
    }
}

function loadUserList(list) {
    displayList(list);
    searchListener();
}

function displayList(list, fromSearch = false) {
    $(listContainer).find('.list-item').off('click').remove();
    const loader = $(listContainer).find('#searchloader');

    if (!fromSearch) {
        if (userSelection) {
            const item = playlistItemHTML(userSelection, false, false)
            addPlayingAnimation($(item))
        }

        listTypeHTML('by Relaxing Clock');
        defaultLibrary.forEach((playlist) => {
            playlistItemHTML(playlist);
        })
    }

    if (list.length > 0) {
        handleLoader($(loader), false, null)
            .finished.then(() => { $(loader).addClass('mini') })

        list.forEach((type) => {
            if (type.length > 0) {
                const listType = getElementDetails(type[0]);
                listTypeHTML(listType.type)
                console.log(type)
                for (const playlist of type) {
                    const addedItem = playlistItemHTML(playlist);
                    $(addedItem).data('details', playlist);
                    if ( userSelection && $(addedItem).data('uri') === userSelection.uri) {
                        addPlayingAnimation($(addedItem))
                    }
                }
            }
        });
    } else {
        $(loader).removeClass('mini');
        handleLoader($(loader), true, null);
    }
}

let searchRequest;
function searchListener() {
    $('#spotify-search').on('input', (event) => {
        const query = event.target.value;
        clearTimeout(searchRequest);

        const wait = 500;
        displayList([]);
        searchRequest = setTimeout(() => {
            console.log(`searching for ${query}`);

            (removeSpace(query) !== '') 
                ? searchContent(query)
                : displayList(userLibrary);
        }, wait);
    })
}

function searchContent(query) {
    search(query, 'album,playlist,show')
        .then((res) => {
            let resultItems = [];

            for (const [key, value] of Object.entries(res)) {
                const items = value.items;
                if (items.length > 0) {
                    if (items[0].type && items[0].type === 'album') {
                        resultItems.push(purgeSingles(items));
                    } else {
                        resultItems.push(items);
                    }
                }
            }

            displayList(resultItems, true);
        });
}

/**
 * 
 Creates a list item in the playlist list and returns the item.
 */

function playlistItemHTML(playlist, playOnClick = true, needsDetails = true) {
    const details = (needsDetails) ? getElementDetails(playlist) : playlist
    const item = $(`<li></li>`).addClass(`settings-text playlist list-item ${playOnClick ? 'pointer' : ''}`)
        .append(`<div class="details skinny no-overflow">
                    <span><img class="playlist-icon flex-center" src="${details.img.url}" alt="${details.name} cover"></span>
                    <span class="name no-overflow">${details.name || ''}</span>
                </div>`)
        .data('playlist', details)
        .appendTo($(listContainer))

    if (playOnClick) $(item).on('click', selectedContent);

    return $(item)
}

/**
 * 
 * @param {String} type 
 */
function listTypeHTML(type, pointer) {
    const item = $(`<li>[${type}]</li>`)
            .addClass(`list-type list-item settings-text ${pointer ? 'pointer' : ''}`)
            .appendTo($(listContainer));

    return $(item);
}



function purgeSingles(albums) {
    return albums.filter((album) => {
        return album.album_type === 'album';
    });
}

function selectedContent(event) {
    const target = event.currentTarget
    const playlistData = ( $(target).data('playlist') );
    console.log(playlistData)

    if (playlistData.id) {
        switch (playlistData.type) {
            case ('show' || 'podcast'):
                loadShowEpisodes(playlistData);
                break;
            
            case 'episode':
                playSelectedContent(playlistData, { uris: [playlistData.uri] }, target);
                break;
            
            default:
                playSelectedContent(playlistData, { context_uri: playlistData.uri }, target);
                break;
        }
    }
}

function playSelectedContent(playlistData, params, target) {
    play(deviceID, params)
        .done(() => {
            userSelection = playlistData;
            addPlayingAnimation($(target));
            $('#default-playlist-type').empty().text(`${userSelection.type}: `);
            $('#default-playlist-text').empty().text(`[${userSelection.name}]`);
            // localStorage.setItem('defaultPlaylist', userSelection.uri)
        })
}

function addPlayingAnimation(target) {
    $(listContainer).find('.current-playing-track').remove();
    const playingAnimation = `
        <span class="loader-container current-playing-track">
            <div class="loader line-scale-party"></div>
        </span>`;

    $(target).find('.details').append(playingAnimation)
        .find('.loader').loaders()
}

function loadShowEpisodes(playlistData) {
    getShowEpisodes(playlistData.id, 25)
        .done((res) => {
            displayList([res.items], true);
            (listTypeHTML('go back', true)).on('click', backToLibrary)
        })
}

function backToLibrary() {
    displayList(userLibrary, false)
}