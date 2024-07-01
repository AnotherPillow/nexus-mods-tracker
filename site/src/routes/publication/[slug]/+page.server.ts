import type { PageServerLoad } from "./$types";
import { turso } from "$lib/turso";
import { error } from "@sveltejs/kit";
import type { DatabaseMod } from "$lib/types";

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params

    const { rows } = await turso.execute({
        sql: "SELECT * FROM mods WHERE uid = @uid",
        args: { uid: slug }
    });

    if (rows.length <= 0) throw error(404, 'Requested UID not in database.')

    return {
        data: rows.shift() as unknown as DatabaseMod
    }
}