"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = __importDefault(require("./classes/Client"));
require("dotenv/config");
const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_PRESENCES'];
const self = new Client_1.default({
    cacheMembers: true,
    cacheRoles: true,
    intents: intents
});
self.start(process.env.TOKEN);
