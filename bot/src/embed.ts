import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import dedent from "dedent";
import Jimp from "jimp";

import * as options from './options'
import { Mod, ModStatus } from "./types";
import { spoilerAdult, threeJimpRead } from "./util";

export const humanReadableStatus = (status: ModStatus) => {
    switch (status) {
        case 'not_published':
            return 'Unpublished'
        case 'published':
            return 'Published'
        case 'removed':
            return 'Removed by uploader'
        case 'wastebinned':
            return 'Removed by staff'
        default:
            return 'Unknown'
    }
}

export const createModEmbed = async (mod: Mod) => {
    let file: AttachmentBuilder | undefined = undefined

    const embed = new EmbedBuilder()
        .setColor(options.EMBED_COLOUR)
        .setTitle(`New Mod Uploaded - ${mod.name ?? '???'}`)
        .setDescription(dedent`
            > ${spoilerAdult(mod.summary, mod) ?? 'No summary known'}
            Mod description can be found at ${options.SERVER_URL}/publication/${mod.uid}
        `)
        .setURL(`https://nexusmods.com/${mod.domain_name}/mods/${mod.mod_id}`)
        .setAuthor({
            name: mod.uploaded_by + ' (' + mod.author + ')',
            iconURL: `https://avatars.nexusmods.com/${mod.user.member_id}/100`,
            url: mod.uploaded_users_profile_url,
        })
        .addFields(
            { inline: true, name: 'Version', value: mod.version},
            { inline: true, name: 'Downloads', value: (mod.mod_downloads ?? '???').toString()},
            { inline: true, name: 'Unique Downloads', value: (mod.mod_unique_downloads ?? '???').toString()},
            { inline: true, name: 'Endorsements', value: (mod.endorsement_count ?? '???').toString()},
            { inline: true, name: 'Contains Adult Content', value: (mod.contains_adult_content ?? '???').toString()},
            { inline: true, name: 'Status', value: '`' + mod.status + '`' + ` (${humanReadableStatus(mod.status)})`},
            { inline: true, name: 'Available', value: mod.available.toString()},
        )
        .setTimestamp(mod.created_timestamp * 1000)
        .setFooter({
            text: `Mod last updated at ${mod.updated_time} / Published `
        })

    if (!mod.contains_adult_content) embed.setImage(mod.picture_url ?? null)
    else if (mod.picture_url) {
        const img = await threeJimpRead(mod.picture_url)
        if (img) {
            img.blur(40)
            const buf = await img.getBufferAsync(Jimp.MIME_PNG)
            
            file = new AttachmentBuilder(buf, { name: 'blurred_mod_icon.png'})
            
            embed.setImage('attachment://blurred_mod_icon.png')
        }
    }

    return {
        embed,
        file
    }
}