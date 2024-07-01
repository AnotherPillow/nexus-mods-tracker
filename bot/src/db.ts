import { Client, createClient } from "@libsql/client";
import { getFilesForMod } from "./api";
import { Mod } from "./types";

export class Database {
    public client: Client;
    
    constructor() {
        this.client = createClient({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });
    }

    async addModToDatabase(mod: Mod) {

        const modFiles = await getFilesForMod(mod.domain_name, mod.mod_id)
        const modFilesString = Buffer.from(
            JSON.stringify(modFiles)
        ).toString('base64')

        const data = {
            uid: mod.uid,
            name: mod.name,
            summary: mod.summary,
            description: mod.description,
            picture_url: mod.picture_url,
            mod_downloads: mod.mod_downloads,
            mod_unique_downloads: mod.mod_unique_downloads,
            mod_id: mod.mod_id,
            domain_name: mod.domain_name,
            version: mod.version,
            endorsement_count: mod.endorsement_count,
            created_timestamp: mod.created_timestamp,
            created_time: mod.created_time,
            updated_timestamp: mod.updated_timestamp,
            updated_time: mod.updated_time,
            author: mod.author,
            uploaded_by: mod.uploaded_by,
            uploaded_users_profile_url: mod.uploaded_users_profile_url,
            //@ts-ignore - It's unreadable but cool ig 
            contains_adult_content: mod.contains_adult_content & 1,
            status: mod.status,
            author_id: mod.user.member_id,
            filesB64: modFilesString
        }

        const keys = Object.keys(data)
        const skeys = keys.join(', ')
        const akeys = keys.map(k => '@'+k).join(', ')

        for (const key of keys) { // Doesn't seem to like undefined
            if (typeof data[key] == 'undefined') data[key] = null
        }

        try {
            await this.client.execute({
                sql: `INSERT INTO mods (${skeys}) VALUES (${akeys})`,
                args: data as any
            })
            console.log(`Inserted mod ${mod.uid} into db.`)
        } catch (e) {
            if (e?.code !== 'SQLITE_CONSTRAINT') 
                console.log(`Failed to insert mod ${mod.uid} into db. ${e.toString()} / ${e.code} ------`)
        }
    }

    async getHighestModID() {
        const query = 'SELECT MAX(mod_id) AS max_id FROM mods';

        try {
            const result = await this.client.execute(query);

            if (result && result.rows && result.rows.length > 0) {
                const maxId = result.rows[0].max_id;
                return maxId as number ?? -1;
            }
            return -1
            
        } catch (error) {
            return -1
        }
    }

    async checkIfUIDExists(uid: number) {
        if (uid == undefined) return false

        const result = await this.client.execute({
            sql: `SELECT 1 FROM mods WHERE uid = @uid`,
            args: { uid }
        })
        return result.rows.length != 0
    }
}