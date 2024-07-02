import 'dotenv/config'
import { Client, Events, GatewayIntentBits, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

const client = new Client({ intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds, GatewayIntentBits.GuildIntegrations ] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
    if (message.channelId == process.env.NEW_MOD_CHAN!) return;
    if (message.content.trim() == '') {
        console.log('Crossposting.')
        message.crosspost().catch(console.error)
    }
})

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isMessageContextMenuCommand()) return;
	if (interaction.commandName != 'Flag Mod') return

    const channel = client.channels.cache.get(process.env.ALERTS_CHAN!)

    //@ts-ignore
    channel!.send({content: `${interaction.targetMessage.url} - <@${interaction.user.id}>`})

    

    interaction.reply({
        content: 'Processed.',
        ephemeral: true,
    })
});

client.login(process.env.BOT_TOKEN!);