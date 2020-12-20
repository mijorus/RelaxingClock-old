import { getPlaylistData,
        getShowList,
        getPlaylistList,
        search }       from "./spotifyRequests";
import { removeSpace,
        handleLoader } from "../utils/utils";

const defaultPlaylists = ['4ZTZhFPPyRzpfHZsWEXAW9'];
// defaultLibrary = [],

var userLibrary = [],
listContainer;
export function playlistLoader(container) {
    listContainer = container;
    if (userLibrary.length === 0) {
        $.when(getPlaylistList(), getShowList())
            .done((playlists, shows, defaults) => {
                userLibrary.push(playlists[0].items, shows[0].items);
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

    if (list.length > 0) {
        handleLoader($(loader), false, null)
            .finished.then(() => { $(loader).addClass('mini') })

        list.forEach((type) => {
            if (type.length > 0) {
                const listType = getElementDetails(type[0]);
                $(`<li class="list-type list-item settings-text">[${listType.type}]</li>`).appendTo($(listContainer));

                for (const element of type) {
                    const details = getElementDetails(element);
                    const item = `
                <li class="settings-text playlist list-item pointer hide">
                    <div class="details skinny">
                        <span><img class="playlist-icon flex-center" src="${details.img.url}" alt="${details.name} cover"></span>
                        <span class="name">${details.name || ''}</span>
                    </div>
                </li>`
                    $(item).appendTo($(listContainer)).removeClass('hide');
                }
            }
        });
    } else {
        $(loader).removeClass('mini');
        handleLoader($(loader), true, null);
    }
}

function getElementDetails(el) {
    const element = (el.show) ? el.show : el;
    return {
        name: element.name || '',
        img: (element.images[1]) ? element.images[1] : element.images[0],
        type: (element.type === 'show') ? 'podcast' : element.type,
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