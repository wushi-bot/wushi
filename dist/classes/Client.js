"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_light_1 = require("discord.js-light");
class Bot extends discord_js_light_1.Client {
    constructor(options) {
        super(options);
        this.owners = ['488786712206770196'];
    }
    start(token) {
        super.login(token);
        return this;
    }
}
exports.default = Bot;
