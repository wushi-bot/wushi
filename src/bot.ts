import Client from './classes/Client';
import 'dotenv/config';

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES'];

const self = new Client({
  cacheMembers: true,
  cacheRoles: true,
  intents: intents
});

self.start(process.env.TOKEN!!);