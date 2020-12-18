import { getPlaylistData,
        getShowList,
        getPlaylistList } from "./spotifyRequests";

var userLibrary = [];
var listContainer;
export function playlistLoader(container) {
    listContainer = container;
    if (userLibrary.length === 0) {
        $.when(getPlaylistList(), getShowList())
            .done((res1, res2) => {
                userLibrary.push(res1[0].items, res2[0].items);
                console.log(userLibrary)
                displayPlaylists();
            })
    } else {
        displayPlaylists();
    }
}

function displayPlaylists() {
    $(listContainer).find('.playlist').remove();

    userLibrary.forEach((type) => {
        for (element of type) {
            const details = getElementDetails(element);
            const item = `
            <li class="settings-text playlist">
                <span class="name skinny">
                    ${details.name || ''}
                    <span class="type skinny">${`[${details.type}]` || ''}</span>
                </span>
            </li>`
            $(item).appendTo($(listContainer));
        }
    });
}

function getElementDetails(element) {
    return {
        name: element.name || element.show.name,
        type: element.type || ((element.show.type) === 'show' ? 'podcast' : element.show.type),
    }
}