import { request } from "undici"

import * as options from './options'
import { Mod, ModFile } from "./types"

const normalHeaders = {
    'User-Agent': options.HTTP_USER_AGENT,
    'apikey': options.apikey,
}

export const getLatestMods = async () => {
    const url = `https://api.nexusmods.com/v1/games/${options.gameName}/mods/latest_added.json`
    
    

    const { body } = await request(url, {
        headers: normalHeaders
    })
    const resp = await body.json()
    
    return resp as Mod[]
}

export const getFilesForMod = async (domain: string, id: string | number) => {
    const categories = 'main,optional,miscellaneous'
    const url = `https://api.nexusmods.com/v1/games/${domain}/mods/${id}/files.json?category=${encodeURIComponent(categories)}`

    const { body } = await request(url, {
        headers: normalHeaders,
    })
    const resp = await body.json() as any

    if (resp.code && resp.code == '403') return []

    const files: ModFile[] = resp?.files ?? [] 
    return files

}

export const getMod = async (domain: string, id: string | number) => {
    const url = `https://api.nexusmods.com/v1/games/${domain}/mods/${id}.json`

    const { body } = await request(url, {
        headers: normalHeaders,
    })
    return await body.json() as Mod
}