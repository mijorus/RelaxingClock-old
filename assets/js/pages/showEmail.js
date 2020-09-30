$('.show-email-btn').on('click', () => {
    $('.show-email-btn').off('click');

    anime({
        targets: $('#email-result').get(0),
        opacity: [1, 0],
        direction: 'alternate',
        duration: 500,
        easing: 'linear',
        loopComplete: () => $('#email-result').text(computeEmail()),
    })
})

function computeEmail() {
    email = 'lorenzo@';
    email += 'mijorus';
    email += '.it';

    return email;
}