import { DISCORD_INVITE_LINK } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
    return redirect(303, DISCORD_INVITE_LINK)
}