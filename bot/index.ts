import 'dotenv/config'
import { Client, Events, GatewayIntentBits, ContextMenuCommandBuilder, ApplicationCommandType, Message, EmbedBuilder, Colors, APIEmbedField } from 'discord.js';
import Nexus, { IFileInfo } from '@nexusmods/nexus-api';
import { getUserByName } from './nexus-graphql';
import { ElementType, FileNode, UnwrappedReturnType } from './types';
import path from 'node:path';
import * as fs from 'node:fs'
// import { write as bunWrite } from 'bun' // for some reason global won't work - why did it fix itself after a few hours?
import 'bun' // why is this needed for types??
import * as fflate from 'fflate/node'
import json5 from 'json5'
import { userInfo } from 'node:os';
import scanDll from './scanner';


const client = new Client({ intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds, GatewayIntentBits.GuildIntegrations ] });
const nexus = await Nexus.create(process.env.NEXUS_API_KEY!, 'nexus-mods-tracker', '0.0.0', 'stardewvalley')

const approxiateFilePath = (fullPath: string, accuracy: number = 3) => {
    const elements = fullPath.split(path.sep)
    return elements.slice(elements.length - accuracy).join(path.sep)
}

const downloadFile = async (modId: number, file: IFileInfo) => {
    const urls = await nexus.getDownloadURLs(modId, file.file_id)
    const uri = (urls.find(x => x.short_name == 'Amsterdam') ?? urls[0]).URI
    
    const res = await fetch(uri)
    
    const outfolder = path.join(process.env.MOD_FOLDER_PATH!, modId.toString(), file.file_id.toString(), `${file.name}-${file.version}`)
    fs.mkdirSync(outfolder, { recursive: true})

    const outpath = path.join(outfolder, file.file_name)
    const extractedfolder = outpath.replace(/(\.rar|\.zip|\.7z|\.exe|\.omod)$/, '_extracted')

    console.log(`Downloading ${uri.replaceAll(userInfo().username, '[username]')} to ${outpath}`)
    if (fs.existsSync(outpath)) {
        console.log('Deleting existing download..')
        fs.rmSync(outpath)
    }
    await Bun.write(outpath, res)
    console.log(`Wrote archive file.`)

    if (outpath.endsWith('.zip')) {
        // const unzipper = new fflate.Unzip(( file ) => {
        //     console.log('unzipped file', file)
        //     Bun.write(path.join(extractedfolder, file.name), file)
        // })
        // unzipper.register(fflate.UnzipInflate);
        // unzipper.push(new Uint8Array(await Bun.file(outpath).arrayBuffer()))
        const unzip = fflate.unzipSync(new Uint8Array(await Bun.file(outpath).arrayBuffer()))
        for (let name of Object.keys(unzip)) {
            name = name.trim()
            console.log(`Writing ${name} from zip.`)
            Bun.write(path.join(extractedfolder, name), unzip[name].buffer)
        }
    } else {
        console.log(outpath, " is not a zip fle, can't extract")
        return null;
    }

    return extractedfolder
}

const walkForSMAPIManifestsAndGetDlls = async (folder: string): Promise<{ manifest: Record<string, any>; manifestPath: string; dllPath: string; }[]> => {
    const glob = new Bun.Glob(`${folder}/**/manifest.json`)
    let results: ElementType<UnwrappedReturnType<typeof walkForSMAPIManifestsAndGetDlls>>[] = []
    for await (const manifestPath of glob.scan()) {
        const manifestFolder = path.dirname(manifestPath)
        const contentText = await Bun.file(manifestPath).text()
        const manifest = json5.parse(contentText)
        const dllPath = path.join(manifestFolder, manifest.EntryDll ?? '_nonexistantdll')

        if (!manifest.EntryDll || 
            manifest.EntryDll.includes('/') ||
            manifest.EntryDll.includes('\\') ||
            !fs.existsSync(dllPath)
        ) {
            console.log(`${manifestPath} has no EntryDll, invalid entrydll or entrydll does not exist`)
            continue
        }
        console.log(`Found manifest: ${manifest.UniqueID}, dll ${manifest.EntryDll}`)
        results.push({
            manifest, manifestPath, dllPath
        })
    }
    return results
}

const confirmSMAPIMod = async (file: IFileInfo) => {
    console.log(`checking if ${file.file_name} is a smapi mod`)
    if (!file) return undefined
    try {
        const preview = file.content_preview_link
        const tree = await (await fetch(preview)).json()

        function findDllPath(tree: FileNode): string | undefined {
            if (tree.type === 'file') {
                return tree.path.endsWith('.dll') ? tree.path : undefined;
            }
            if (!tree.children) return undefined;

            for (const child of tree.children) {
                const found = findDllPath(child);
                if (found) return found;
            }
            return undefined;
        }

        const dll = findDllPath(tree)
        console.log('found dll', dll)
        return dll
    } catch (e) {
        return undefined;
    }
}

const asyncArrayFinder = async <T>(arr: T[], filter: (element: T) => Promise<boolean>): Promise<T | null> => {
    for (const element of arr) {
        const fits = await filter(element)
        if (fits) return element;
    }
    return null;
}

const checkMessageEmbeds = async (message: Message) => {
    const { embeds } = message
    const responseEmbeds: EmbedBuilder[] = []

    for (const embed of embeds) {
        if (!embed.author || embed.author.name != 'New Mod Upload (Stardew Valley)') continue;
        const { url } = embed
        const modid = url?.split('/').at(-1)?.split('?')[0] // last section of url before url params
        
        const uploader = embed.fields.find(f => f.name == 'Uploader')?.value.split('](')[0].replace('[', '').trim();
        if (!modid || !uploader) return console.error('Invalid embed:', embed);

        const userData = await getUserByName(uploader)
        const user = userData.data.userByName
        
        let responseEmbed = new EmbedBuilder()
        let responseDescription = ''
        let responseFields: APIEmbedField[] = []
        let responseColour: number = Colors.Orange
        responseEmbed.setTitle(embed.title)
        
        // account created less than 2 days ago
        if (new Date(user.joined).getTime() > Date.now() - 2 * 24 * 60 * 60 * 1000) {
            responseDescription += `> ⚠️ Author account created <t:${Math.floor(new Date(user.joined).getTime() / 1000)}:R>\n`
        } else {
            console.log(`https://nexusmods.com/stardewvalley/mods/${modid} - author account OLDER than 2 days`)
        }

        console.log('getting files')
        let doReturnFromModFiles = false
        const files = await nexus.getModFiles(parseInt(modid), 'stardewvalley').catch((e) => {
            responseDescription += `Failed to get mod files, received error ${e.mStatusCode}`
            doReturnFromModFiles = true
        })
        console.log('got ifles')
        
        if (doReturnFromModFiles || !files) {
            console.log('failed to get files / didnt get files', doReturnFromModFiles, files);
            responseEmbed.setDescription(responseDescription)
            responseEmbeds.push(responseEmbed)

            continue;
        }
        console.log(files)

        const file = await asyncArrayFinder<IFileInfo>(files.files, async (element: IFileInfo) => {
            if (element.category_name != 'MAIN') return false;
            
            const confirmation = await confirmSMAPIMod(element)
            if (!confirmation) return false;

            return true;
        })
        console.log('File selected: ' + file?.file_name)
        // const file = await (files.files.length > 0 ? await files.files.find(async f => {
        //     const confirmation = await confirmSMAPIMod(f)
        //     console.log('finding f', f.category_name, confirmation)
        //     return f.category_name == 'MAIN' && confirmation
        // }) : await confirmSMAPIMod(files.files[0]) && files.files[0])
        const smapiconfirmation = file ? await confirmSMAPIMod(file) : null

        if (/*responseDescription == '' || */!file || !file.name || !smapiconfirmation) {
            // responseDescription += 'Failed to get file, Mod may:\n'
            // responseDescription += '- Not be considered suspicious\n'
            // responseDescription += '- Not have any main files\n'
            // responseDescription += '- Not be a SMAPI mod\n'
            // responseDescription += '- Be missing a file name\n'
            // responseEmbed.setDescription(responseDescription)
            // responseEmbeds.push(responseEmbed)
            continue
        }

        console.log('smapi mod file', file)
        responseDescription += `File: **${file.file_name}** ([virustotal](${file.external_virus_scan_url}), [preview](${file.content_preview_link}))\n`
        
        const outputDirectory = await downloadFile(parseInt(modid), file)

        if (!outputDirectory) {
            responseDescription += '> Cannot extract file, unsupported type/errored.'
            responseEmbed.setDescription(responseDescription)
            responseEmbeds.push(responseEmbed)
            continue
        }
        responseDescription += `> Extracted to \`${outputDirectory.replaceAll(userInfo().username, '[username]')}\`\n`

        const smapisubmods = await walkForSMAPIManifestsAndGetDlls(outputDirectory)

        responseDescription += `Identified ${smapisubmods.length} SMAPI sub mods\n`
        for (const sm of smapisubmods) {
            // responseDescription += `- __${sm.manifest.UniqueID}__ (Entry: \`${approxiateFilePath(sm.dllPath)}\`)\n`
            const scan = await scanDll(sm.dllPath, sm.manifestPath, sm.manifest)
            console.log(sm.manifest.UniqueID, ' scan results ', scan)

            if (scan.flags.length == 0) {
                responseFields.push({
                    name: `${sm.manifest.UniqueID} (Entry: \`${approxiateFilePath(sm.dllPath)}\`)`,
                    value: 'No flags found!',
                    inline: true,
                })    
                responseColour = Colors.Green
                continue
            }

            responseColour = Colors.Red
            
            responseFields.push({
                name: `${sm.manifest.UniqueID} (Entry: \`${approxiateFilePath(sm.dllPath)}\`)`,
                value: scan.flags.map(x => `__**${x.name}**__\n>>> ${x.description}`).join('\n'),
                inline: true,
            })
        }


        responseEmbed.setDescription(responseDescription)
        responseEmbed.setFields(responseFields)
        responseEmbed.setColor(responseColour)

        responseEmbeds.push(responseEmbed)
        // const 
    }

    if (responseEmbeds.length > 0) 
        message.reply({
            // content: JSON.stringify(user, null, 2),
            content: '',
            embeds: responseEmbeds
        })
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
    if (message.channelId == process.env.NEW_MOD_CHAN!) {
        if (message.author.id != '1393642385904373831') return;

        const { embeds } = message
        if (embeds.length == 0) return;

        checkMessageEmbeds(message)
    }
    if (message.content.trim() == '') {
        console.log('Crossposting.')
        message.crosspost().catch(console.error)
    }
})

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isMessageContextMenuCommand()) return;
	
    switch (interaction.commandName) {
        case 'Flag Mod':
            const channel = client.channels.cache.get(process.env.ALERTS_CHAN!)

            //@ts-ignore
            channel!.send({content: `${interaction.targetMessage.url} - <@${interaction.user.id}>`})

            interaction.reply({
                content: 'Processed.',
                ephemeral: true,
            })
            break;
        case 'Check Malicious':
            const message = interaction.targetMessage
            if (message.author.id != '1393642385904373831') {
                interaction.reply({
                    content: 'This message is not from the bot.',
                    ephemeral: true,
                })
                return;
            }
            checkMessageEmbeds(message)
            interaction.reply({
                content: 'Checked message.',
                ephemeral: true,
            })
            break;
        default: break;
    }    
});

client.login(process.env.BOT_TOKEN!);