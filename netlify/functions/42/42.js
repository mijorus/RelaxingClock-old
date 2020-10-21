const axios = require('axios');

exports.handler = async (event, context) => {
    const baseURL = 'https://api.intra.42.fr/oauth/authorize'
    const state = randomString(32)
    var url = baseURL
    url += '?client_id=78c220293ecfd19a38ca6ce01e1e2f45452148cf98302e5568af77a130714ed8'
    url += '&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2F'
    url += '&response_type=code'
    url += `&state=${encodeURIComponent(state)}`
    url += '&scope=public,projects,tig,forum'

    var api = await axios.get('https://reqres.in/api/users?page=2')
    .then((res) => {
        return res.data
    })
    .catch((err) => {
        return err
    })

    function randomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: api })
    }
}