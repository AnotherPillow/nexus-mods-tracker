import { EmbedBuilder } from 'discord.js';
import 'dotenv/config';
import { getLatestMods } from './src/api';
import { Database } from './src/db';
import { createModEmbed } from './src/embed';
import { numsInRangeEx } from './src/util';

import webhook from './src/webhook'

/*(async function() {
    const mods = await getLatestMods()
    
    const embeds: EmbedBuilder[] = []
    for (const mod of mods) {
        embeds.push(createModEmbed(mod))
    }
    webhook.sendWebhook({ embeds })
})()*/

const time = 30 * 60 * 1000 // 30 mins
const checkFunction = async () => {
    const db = new Database()
    
    const mods = await getLatestMods()
    const latestIDs = mods.map(mod => mod.mod_id)
    
    const highestIDPreviously = await db.getHighestModID()
    const lowestInLatest = Math.min(0, ...latestIDs)
    // const highestInLatest = Math.max(0, ...latestIDs)

    const IDsToCheck = highestIDPreviously > 0 ? 
        numsInRangeEx(highestIDPreviously, lowestInLatest) : 
        []

    const embeds: EmbedBuilder[] = []
    const files = [] as any
    for (const mod of mods) {
        const { embed, file } = await createModEmbed(mod)
        embeds.push(embed)
        if (file) files.push(file)
        db.addModToDatabase(mod)
    }
    
    webhook.sendWebhook({ embeds, files })
    

}

checkFunction()
const checker = setInterval(checkFunction, time)