import axios from 'axios'

// https://github.com/roydejong/timbot/blob/master/twitch-api.js

export default class TwitchApi {
  get requestOptions() {
    // Automatically remove "oauth:" prefix if it's present
    const oauthPrefix = "oauth:"
    let oauthBearer = process.env.TWITCH_ACCESS_TOKEN
    if (oauthBearer.startsWith(oauthPrefix)) {
      oauthBearer = oauthBearer.substr(oauthPrefix.length)
    }
    // Construct default request options
    return {
      baseURL: "https://api.twitch.tv/helix/",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${oauthBearer}`
      }
    }
  }

  handleApiError(err) {
    const res = err.response || { }

    if (res.data && res.data.message) {
      console.error('[Twitch API]', 'API request failed with Helix error:', res.data.message, `(${res.data.error}/${res.data.status})`)
    } else {
      console.error('[Twitch API]', 'API request failed with error:', err.message || err)
    }
  }

  fetchStreams(channelNames) {
    return new Promise((resolve, reject) => {
      axios.get(`/streams?user_login=${channelNames.join('&user_login=')}`, this.requestOptions)
        .then((res) => {
          resolve(res.data.data || [])
        })
        .catch((err) => {
          this.handleApiError(err)
          reject(err)
        })
    })
  }

  fetchUsers(channelNames) {
    return new Promise((resolve, reject) => {
      axios.get(`/users?login=${channelNames.join('&login=')}`, this.requestOptions)
        .then((res) => {
          resolve(res.data.data || [])
        })
        .catch((err) => {
          this.handleApiError(err)
          reject(err)
        })
    });
  }

  fetchGames(gameIds) {
    return new Promise((resolve, reject) => {
      axios.get(`/games?id=${gameIds.join('&id=')}`, this.requestOptions)
        .then((res) => {
          resolve(res.data.data || [])
        })
        .catch((err) => {
          this.handleApiError(err)
          reject(err)
        })
    })
  }
}