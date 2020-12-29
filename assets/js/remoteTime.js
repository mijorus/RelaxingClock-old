import { handleLoader } from "./utils/utils";

export function remoteTime() {
    const rtLoader = $('.remote-time-loader');
    $(rtLoader.get(0).nextElementSibling).addClass('unavailable');
    handleLoader($(rtLoader), true);
    return $.ajax({
        method: "GET",
        url: '/.netlify/functions/remoteTime',
        dataType: "json",
    })
        .done(function() {
            handleLoader($(rtLoader), false, true);
            $(rtLoader.get(0).nextElementSibling).removeClass('unavailable');
        })
        .fail(function (error) {
            console.error(error.responseText);
            handleLoader($(rtLoader), false, false);
            $(rtLoader.get(0).nextElementSibling).removeClass('unavailable');
        })
}