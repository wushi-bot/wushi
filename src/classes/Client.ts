import { Client, Collection, ClientOptions } from 'discord.js-light';

export default class Bot extends Client {
  owners: any
  constructor (options: any) {
    super(options)
    this.owners = ['488786712206770196']
  }
  start (token: string) {
    super.login(token)
    return this
  }
}