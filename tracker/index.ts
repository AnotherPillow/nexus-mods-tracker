import 'dotenv/config';
import { EmbedBuilder } from 'discord.js';
import * as fs from 'node:fs';

import { getLatestMods, getMod } from './src/api';
import { Database } from './src/db';
import { createModEmbed } from './src/embed';
import { numsInRangeEx, splitArray } from './src/util';
import webhook from './src/webhook'
import * as options from './src/options'
import { Mod, SuccessfulMod } from './src/types';


/*(async function() {
    const mods = await getLatestMods()
    
    const embeds: EmbedBuilder[] = []
    for (const mod of mods) {
        embeds.push(createModEmbed(mod))
    }
    webhook.sendWebhook({ embeds })
})()*/

let currentMaxCount = fs.existsSync('latest.txt') ? parseInt(fs.readFileSync('latest.txt', 'utf-8').toString()) : -1

const time = 30 * 60 * 1000 // 30 mins
const checkFunction = async () => {
    const db = new Database()
    
    const mods = await getLatestMods() as SuccessfulMod[]
    const latestIDs = mods.map(mod => mod.mod_id ?? 999999999)
    
    const lowestInLatest = Math.min(...latestIDs ?? currentMaxCount)

    const IDsToCheck = currentMaxCount > 0 ? 
        numsInRangeEx(currentMaxCount, lowestInLatest) : 
        []
    console.log(IDsToCheck, lowestInLatest, currentMaxCount, fs.existsSync('latest.txt'), fs.readFileSync('latest.txt', 'utf-8').toString(), parseInt(fs.readFileSync('latest.txt', 'utf-8').toString()))

    for (const id of IDsToCheck) {
        const mod = await getMod(options.gameName!, id)
        // console.log(mod)
        mods.push(mod as SuccessfulMod)
    }

    const embeds: EmbedBuilder[] = []
    const files = [] as any
    for (const mod of mods) {
        if (await db.checkIfUIDExists(mod.uid)) continue

        const modEmbed = await createModEmbed(mod)
        if (!modEmbed) continue
        
        const { embed, file } = modEmbed
        embeds.push(embed)
        if (file) files.push(file)
        db.addModToDatabase(mod)
        
        
    }

    const subarrays = splitArray(embeds, 10)
    
    for (const embeds of subarrays) 
        webhook.sendWebhook({ embeds, files });
    
    // let newLatest = Number(mods.sort((a, b) => a.mod_id - b.mod_id).shift()?.mod_id ?? '-1') // get the lowest mod_id in mods
    let newLatest = currentMaxCount = Number(mods.sort((a, b) => a.mod_id ?? 0 - b.mod_id ?? 0).shift()?.mod_id ?? '-1') // get highest mod_id in mods
    fs.writeFileSync('latest.txt', newLatest.toString())
    

}

try {
    checkFunction()
} catch (e) {
    console.error(e)
}
const checker = setInterval(async () => checkFunction().catch(console.error), time)