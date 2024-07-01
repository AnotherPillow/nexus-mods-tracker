<script>
    import { onMount } from "svelte";
    import { DISCORD_INVITE_LINK } from "$env/static/private";

    onMount(() => {
        document.location.href = DISCORD_INVITE_LINK
    })
</script>