import { Message } from "discord.js";
import Bot from "../models/Client";

exports.run = async (bot: Bot, message: Message) => {
  if (message.author.bot) return
}