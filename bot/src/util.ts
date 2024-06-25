import { Mod } from "./types"

import webp from 'webp-converter'
import Jimp from "jimp";
import http from 'node:https'
import * as fs from 'node:fs'


export const numsInRangeEx = (start: number, end: number) => {
    if (start >= end) return []
    return Array(end - start).fill(0).map((_,i) => i + start).slice(1)
}

export const spoilerAdult = (text: string | undefined | null, mod: Mod) => {
    if (!text) return ''
    if (mod.contains_adult_content) text = `||${text}||`
    return text
}

// https://github.com/jimp-dev/jimp/issues/144#issuecomment-774672335
export const jimpRead = (imgUrl: string, forceWebP: boolean = false) => {
    return new Promise(async (resolve, reject) => {
        // Check if .webp, requires additional handling
        if(imgUrl.match(/(\.webp)/gi) || forceWebP) {
            // Get .webp image
            const file = fs.createWriteStream(__dirname+"/tmp.webp");
            const request = http.get(imgUrl, async function(response) {
                await response.pipe(file); // Save to tmp.webp
                let result = await webp.dwebp(__dirname+"/tmp.webp", __dirname+"/tmp.png", "-o"); // Convert to tmp.webp -> tmp.png
                let img = await Jimp.read(__dirname+'/tmp.png') // Read tmp.png for jimp
                fs.unlink(__dirname+"/tmp.webp", () => {}); // Remove tmp.webp
                fs.unlink(__dirname+"/tmp.png", () => {}); // Remove tmp.png
                resolve(img); // Resolve image converted to image/png
            });
        } else {
            // Read image type supported by jimp
            Jimp.read(imgUrl).then(async img => {
                resolve(img) // Resolve image
            });
        }
    }) as Promise<Jimp>
}

export const threeJimpRead = (url: string) => {
    try {
        return jimpRead(url, true)
    } catch (e) {
        if (fs.existsSync(__dirname+"/tmp.webp"))
            fs.unlinkSync(__dirname+"/tmp.webp")
        if (fs.existsSync(__dirname+"/tmp.png"))
            fs.unlinkSync(__dirname+"/tmp.png")
        try {
            return jimpRead(url)
        } catch (e) {
            if (fs.existsSync(__dirname+"/tmp.webp"))
                fs.unlinkSync(__dirname+"/tmp.webp")
            if (fs.existsSync(__dirname+"/tmp.png"))
                fs.unlinkSync(__dirname+"/tmp.png")

            try {
                return Jimp.read(url)
            } catch (e) {
                return null
            }
        }
    }
}