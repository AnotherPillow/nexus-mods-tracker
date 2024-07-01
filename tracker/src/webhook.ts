import { EmbedBuilder, WebhookClient } from 'discord.js';
import * as options from './options'

export const hook = new WebhookClient({ url: options.webhookURL! });

export const sendWebhook = ({
    content = '',
    username = options.webhookName,
    avatarURL = undefined,
    embeds = [] as EmbedBuilder[],
    files = undefined
}) => {
    hook.send({ content, username, avatarURL, embeds, files})
}

export default {
    sendWebhook
}