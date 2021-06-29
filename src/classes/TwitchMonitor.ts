import db from 'quick.db'
import TwitchAPI from './TwitchAPI'
import Client from './Client'
const twitchDb = new db.table('twitch')
const API = new TwitchAPI()

// https://github.com/roydejong/timbot/blob/master/twitch-monitor.js

export default class TwitchMonitor {

    client: Client

    constructor(client) {
        this.client = client
    }

    start() {
        setInterval(() => {
            this.refresh('Periodic refresh')
        }, 30000)
        setTimeout(() => {
            this.refresh('Initial refresh')
        }, 1000)
    }

    refresh(reason: string) {
        console.log('[Twitch]', `Refreshing now (${reason ? reason : "No reason"})`)
        twitchDb.all().forEach(async val => {
            let list = []
            val.data.users.forEach(name => {
                list.push(name.toLowerCase())
            })
            await API.fetchStreams(list)
                .then(streams => {
                    streams.forEach(stream => {
                        if (stream.type === 'live') {
                            if (!twitchDb.get(`${val.ID}.${stream.id}`)) {
                                console.log(val.ID, stream.id)
                                const channel = this.client.channels.cache.get(`${val.data.channel}`)
                                let message = twitchDb.get(`${val.ID}.message`)
                                if (message) {
                                    message = message.replace('{username}', stream.user_name)
                                    message = message.replace('{title}', stream.title)
                                    message = message.replace('{url}', `https://twitch.tv/${stream.user_name}`)
                                    message = message.replace('{game}', stream.game_name)
                                    message = message.replace('{started_at}', stream.started_at)
                                    message = message.replace('{language}', stream.language)
                                    channel.send(message)
                                    twitchDb.set(`${val.ID}.${stream.id}`, true)
                                }
                            }                            
                        }
                    })
                })
                .catch(err => {
                    console.error(err)
                })
        })         
    }

}
