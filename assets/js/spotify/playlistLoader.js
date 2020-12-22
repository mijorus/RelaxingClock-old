import { getPlaylistData,
        getShowList,
        getPlaylistList,
        search }           from "./requests";
import { removeSpace,
        handleLoader }     from "../utils/utils";

import { defaultPlaylist } from "./player";

var userLibrary = [],
defaultLibrary = [],
listContainer;
export function playlistLoader(container) {
    listContainer = container;
    if (userLibrary.length === 0) {
        $.when(getPlaylistList(), getShowList(), getPlaylistData(defaultPlaylist[0]), getPlaylistData(defaultPlaylist[1]))
            .done((playlists, shows, default1, default2) => {
                userLibrary.push(playlists[0].items, shows[0].items);
                defaultLibrary.push(default1[0], default2[0]);
                console.log(defaultLibrary);
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

function displayList(list) {
    $(listContainer).find('.list-item').remove();
    const loader = $(listContainer).find('#searchloader');

    listTypeHTML('by Relaxing Clock');
    defaultLibrary.forEach((playlist) => {
        playlistItemHTML(playlist);
    })

    if (list.length > 0) {
        handleLoader($(loader), false, null)
            .finished.then(() => { $(loader).addClass('mini') })

        list.forEach((type) => {
            if (type.length > 0) {
                const listType = getElementDetails(type[0]);
                listTypeHTML(listType.type)

                for (const playlist of type) {
                    playlistItemHTML(playlist);
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
            console.log(`searching for ${query}`)
            if (removeSpace(query) !== '') {
                searchContent(query);
            } else {
                displayList(userLibrary);
            }
        }, wait);
    })
}

function searchContent(query) {
    search(query, 'album,playlist,show')
        .then((res) => {
            console.log(res);
            let resultItems = [];

            for (const [key, value] of Object.entries(res)) {
                const items = value.items;
                if (items.length > 0) {
                    if (items[0].type && items[0].type === 'album') {
                        const purgeSignles = items.filter((album) => {
                            return album.album_type === 'album';
                        });

                        resultItems.push(purgeSignles);
                    } else {
                        resultItems.push(items);
                    }
                }
            }

            displayList(resultItems);
        });
}

function playlistItemHTML(playlist) {
    const details = getElementDetails(playlist)
    const item = `
    <li class="settings-text playlist list-item pointer hide">
        <div class="details skinny">
            <span><img class="playlist-icon flex-center" src="${details.img.url}" alt="${details.name} cover"></span>
            <span class="name">${details.name || ''}</span>
        </div>
    </li>`;

    $(item).appendTo($(listContainer)).removeClass('hide');
}

function listTypeHTML(type) {
    const item = $(`<li class="list-type list-item settings-text">[${type}]</li>`);
    $(item).appendTo( $(listContainer) );
}

function getElementDetails(el) {
    console.log(el);
    const element = (el.show) ? el.show : el;
    return {
        name: element.name || '',
        img: (element.images[1]) ? element.images[1] : element.images[0],
        type: (element.type === 'show') ? 'podcast' : element.type,
    }
}