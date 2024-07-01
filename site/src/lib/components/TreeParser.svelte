

<script lang="ts">
    import { onMount } from "svelte";


    export let url;
    let html = ''

    onMount(async () => {
        if (!url) return;
        const data = await window.fetch('/api/get-file-tree', {
            method: 'POST',
            body: JSON.stringify({url}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(r => r.json())
        html = JSON.stringify(data)

        const renderTree = (node: any) => {
            if (node.type === 'directory' || !node.type) {
                return `
                    <li class="directory file_tree">
                        ${node.type ? '<span class="file_tree">' + node.name + '</span>' : ''}
                        <ul class="file_tree">
                            ${node.children.map((child: any) => renderTree(child)).join('')}
                        </ul>
                    </li>
                `;
            } else {
                return `
                    <li class="file file_tree">
                        <span class="file_tree">${node.name} (${node.size})</span>
                    </li>
                `;
            }
        };

        html = renderTree(data)
    })


</script>

<ul class="file_tree">
    {@html html ?? 'Loading file tree...'}
</ul>

{#if false} <!-- to get rid of "oh no unused css rules!!" errors-->
    <ul>
        <li class="directory file">
            <span></span>
        </li>
    </ul>
{/if}

<style lang="scss">
    :global(ul.file_tree) {
        text-align: left;
        list-style-type: none;
        padding-left: 20px;
    }

    :global(li.file_tree) {
        margin: 5px 0;
    }

    :global(.directory.file_tree > span.file_tree::before) {
        content: "📁";
        margin-right: 5px;
    }

    :global(.file.file_tree > span.file_tree::before) {
        content: "📄";
        margin-right: 5px;
    }
</style>