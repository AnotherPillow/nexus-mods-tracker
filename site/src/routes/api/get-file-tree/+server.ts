import { json } from "@sveltejs/kit";
import { request as UR } from "undici"
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from "$env/static/private";

export async function POST({ request, cookies }) {
	const { url } = await request.json();

	if (!url || !url.trim || !url.trim().startsWith('https://file-metadata.nexusmods.com/file/nexus-files-s3-meta/')) return json({
        'message': 'Invalid or malformed URL'
    }, {status: 406})

    const tree = await (await UR(url, {
        'headers': {
            'User-Agent': 'nexus-mods-tracker v0 // frontend anti-cors file tree proxy'
        }
    })).body.json()

    return json(tree, { status: 200 })


}
