import { DISCORD_INVITE_LINK } from "$env/static/private";
import { redirect } from "@sveltejs/kit";

export async function GET({ request, cookies }) {
    return redirect(303, DISCORD_INVITE_LINK)
}