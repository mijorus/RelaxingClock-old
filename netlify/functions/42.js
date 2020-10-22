const axios = require('axios');
const { jsonQueryParse } = require('json-query-string');

exports.handler = async (event, context) => {
     if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed", event: event }) }
    } else {
        const bodyParams = jsonQueryParse(event.body);
        const baseURL = 'https://api.intra.42.fr/oauth/token'
        const code = bodyParams.code
        const state = bodyParams.state
        console.log(bodyParams);
        var url = baseURL
        url += '?client_id=78c220293ecfd19a38ca6ce01e1e2f45452148cf98302e5568af77a130714ed8'
        url += '&grant_type=authorization_code'
        url += `&client_secret=${process.env.FR_SECRET}`
        url += `&code=${code}`
        url += '&redirect_uri=http://localhost:3000'
        url += `&state=${state}`
        console.log(url);
        var api = await axios.post(url)
        .then((res) => {
            return res.data
        })
        .catch((err) => {
            return err
        })

        return {
            statusCode: 200,
            body: JSON.stringify({ message: api, url: url })
        }
    }
}