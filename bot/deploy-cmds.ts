import 'dotenv/config'
import { ApplicationCommandType, ContextMenuCommandBuilder, REST, Routes } from 'discord.js'

const flagcmd = new ContextMenuCommandBuilder()
	.setName('Flag Mod')
	.setType(ApplicationCommandType.Message);

const checkmalicious = new ContextMenuCommandBuilder()
	.setName('Check Malicious')
	.setType(ApplicationCommandType.Message);

const rest = new REST().setToken(process.env.BOT_TOKEN!);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.SERVER_ID!),
			{ body: [
                flagcmd.toJSON(),
                checkmalicious.toJSON()
            ] },
		);

		console.log(`Successfully reloaded application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();