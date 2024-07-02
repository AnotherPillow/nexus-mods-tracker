<script lang="ts">
    import type { ModFile } from '$lib/types.js';
    import { humanReadableStatus } from '$lib/util.js';
    import '@fontsource/poppins';
    import '@fontsource-variable/jetbrains-mono';
    import { onMount } from 'svelte';
    import TreeParser from '$lib/components/TreeParser.svelte';
    
    export let data;
    let fileDialogue: HTMLDialogElement | null = null
    let description = 'Loading Description...';

    onMount(async () => {
        // @ts-ignore
        const bbobHTML = await import('@bbob/html');
	    // @ts-ignore
	    const presetHTML5 = await import('@bbob/preset-html5')
        console.log('Imported bbob!')
        
        description = data.data.description ? bbobHTML.default(data.data.description, presetHTML5.default()) : 'No known description.'
        fileDialogue = document.querySelector('#filetree')
    })

    const files: ModFile[] = JSON.parse(atob(data.data.filesB64))
    
    let displayedFile: ModFile | null = null

    const displayFurtherFileDetails = (file: ModFile) => {
        displayedFile = file
        fileDialogue?.showModal()
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog id="filetree" on:click={(ev) => {
    //@ts-ignore
    if (ev.target.nodeName == 'DIALOG') ev.target.close()
}}>
    <div id="dialog-content">
        <h2>{displayedFile?.name} | {displayedFile?.version}</h2>
        <h5><span><kbd>{displayedFile?.file_name}</kbd></span> <span>({displayedFile?.size_kb} kb)</span></h5>

        <table id="file-preview-etc-table">
            <tbody>
                <tr>
                    <th>
                       File Preview 
                    </th>
                    <th>
                       &nbsp;
                    </th>
                </tr>
                <tr>
                    <td>
                        {#if displayedFile?.content_preview_link}
                            <TreeParser url={displayedFile.content_preview_link} />
                        {:else}
                            No preview available
                        {/if}
                    </td>
                    <td>
                        <ul id="misc-items-list">
                            <li>
                                <a href={displayedFile?.external_virus_scan_url} target="_blank">Virustotal</a>
                            </li>
                            <li>
                                <button on:click={() => window.navigator.clipboard.writeText(displayedFile?.changelog_html ?? 'No changelog available')}>Copy Changelog HTML</button>
                            </li>
                            <li>
                                Mod version: {displayedFile?.mod_version}
                            </li>
                            <li>
                                Version: {displayedFile?.version}
                            </li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</dialog>

<div id="most-top-notice">
    <h1>ALL DATA IS FROM WITHIN 0-30 MINUTES OF PUBLISH. IT IS NOT UP TO DATE.</h1>
</div>
<main>
    <!-- <h1>{JSON.stringify(data.data, null, 4)}</h1> -->
    <div id="top-title-bar">
        <a class="title" target="_blank" href={`https://nexusmods.com/${data.data.domain_name}/mods/${data.data.mod_id}`}><h1>{data.data.name ?? 'No Known Mod Name'}</h1></a>
        <table id="uploader-author-area">
            <tbody>
                <tr>
                    <th>
                        Author
                    </th>
                    <th>
                        Uploaded By
                    </th>
                </tr>
                <tr>
                    <td>
                        {data.data.author}
                    </td>
                    <td>
                        <img id="user-pfp" src={`https://avatars.nexusmods.com/${data.data.author_id}/100`} height="10%" alt="Profile Icon"/>
                        <a class="title" href={data.data.uploaded_users_profile_url}><h3>{data.data.uploaded_by}</h3></a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div id="lower-large-section">
        <div id="left-section">
            <div id="summary-bit">    
                <div>
                    <span>{data.data.summary ?? '???'}</span>
                </div>
            </div>
            <hr />
            <div id="description-text">
                <img src={data.data.picture_url} alt="Mod background Img" id="big-picture" class={data.data.contains_adult_content ? 'blurred' : ''}>
                <hr>
                <span>{@html description}</span>
            </div>
        </div>
        
        <div id="right-section">
            <table id="downloads-table">
                <tbody>
                    <tr>
                        <th>
                            Downloads
                        </th>
                        <th>
                            Unique Downloads
                        </th>
                        <th>
                            Endorsements
                        </th>
                    </tr>
                    <tr>
                        <td>
                            {data.data.mod_downloads}
                        </td>
                        <td>
                            {data.data.mod_unique_downloads}
                        </td>
                        <td>
                            {data.data.endorsement_count}
                        </td>
                    </tr>
                </tbody>
            </table>
            <br>
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <a class="hover-pointer" title="Click to timestamp" on:click={((e) => {
                e.preventDefault()
                window.navigator.clipboard.writeText(data.data.created_time)
            })}>Created at {new Date(data.data.created_time).toLocaleString()}</a>
            <br>
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <a class="hover-pointer" title="Click to timestamp" on:click={((e) => {
                e.preventDefault()
                window.navigator.clipboard.writeText(data.data.updated_time)
            })}>Updated at {new Date(data.data.updated_time).toLocaleString()}</a>

            <p>Status: <strong>{data.data.status} ({humanReadableStatus(data.data.status)})</strong></p>
            {#if data.data.contains_adult_content}
                <p class="adult-warning">Contains adult content</p>
            {/if}
            <h3 id="files-txt">Files</h3>
            <div id="files-container">
                {#each files as file}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="file-item" on:click={() => displayFurtherFileDetails(file)}>
                        <h3 class="file-title">{file.name}</h3>
                        <table class="file-detail-table"> 
                            <tbody>
                                <tr>
                                    <th>
                                        Version
                                    </th>
                                    <th>
                                        Category
                                    </th>
                                    <th>
                                        Primary
                                    </th>
                                    <th>
                                        Uploaded
                                    </th>
                                </tr>
                                <tr>
                                    <td>
                                        {file.version}
                                    </td>
                                    <td>
                                        {file.category_name}
                                    </td>
                                    <td>
                                        {file.is_primary ? 'True' : 'False'}
                                    </td>
                                    <td title="Click to timestamp" on:click={((e) => {
                                        e.preventDefault()
                                        window.navigator.clipboard.writeText(data.data.created_time)
                                    })}>
                                        {new Date(file.uploaded_time).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <h4>Click for details.</h4>
                    </div>
                {/each}
            </div>
        </div>
    </div>

</main>

<style lang="scss">
    dialog {
        height: 100vh;
        width: 100vw;

        outline: none;
        border: none;

        background-color: #43434366;
        
        kbd {
            font-family: 'JetBrains Mono Variable', monospace;
            font-weight: 200;
        }

        #dialog-content {
            position: absolute;
            inset: 0;
            
            margin: auto;
            text-align: center;

            height: 60vh;
            width: 50vw;

            background-color: #1a1a1a;
            color: white;
            border-radius: 1em;

            overflow: scroll;
            scrollbar-width: none;

            ::-webkit-scrollbar {
                display: none;
            }

            #file-preview-etc-table {
                margin: 0 5%;
                &, tbody, tr, th, td {
                    border: 1px solid #878787;
                }
                
                width: 90%;
                border-collapse: collapse;

                td {
                    width: 50%;
                }

                #misc-items-list {
                    list-style-type: '⇒';
                    
                    a {
                        color: orange;
                    }

                    button {
                        outline: none;
                        border: none;
                        
                        color: orange;
                        background-color: transparent;
                        
                        cursor: pointer;
                        text-decoration: underline;
                        
                        font-family: inherit;
                        font-size: inherit;
                        font-weight: inherit;
                    }
                }
            }

        }
    }

    #most-top-notice {
        width: 100%;
        height: 5em;
        background-color: darkred;
        color: white;
        
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        
        h1 {
            margin: 0;
        }
    }
    
    .hover-pointer {
        cursor: pointer;
    }
    
    .adult-warning {
        text-align: center;
        background-color: rgb(205, 53, 27);
    }

    :global(body) {
        margin: 0;
        font-family: 'Poppins', sans-serif;   
    }

    #lower-large-section {
        display: flex;
        #right-section {
            margin-top: 1em;
            padding-left: 1em;
            width: 33%;

            #files-container {
                .file-item {
                    width: 80%;
                    height: 150px;
                    
                    margin: 1em 10%;
                    padding: 1em;
                    border-radius: 10px;
                    
                    background-color: rgb(56, 56, 56);
                    text-align: center;

                    .file-title {
                        margin: 0;
                        font-weight: bold;
                        color: rgb(250, 175, 34);
                    }

                    .file-detail-table {
                        width: 100%;
                        border-collapse: collapse;
                        
                        &, * {
                            border: 1px solid #878787;
                        }
                    }

                    &:hover {
                        filter: brightness(0.8);
                        cursor: pointer;
                    }
                }
            }

            #downloads-table {
                margin: 0 auto;
                width: 80%;
                border-collapse: collapse;
                text-align: center;

                &, * {
                    border: 1px solid rgb(64, 64, 64);
                }
            }

            #files-txt {
                text-align: center;
            }
        }
        #left-section {
            width: 66%;
            
            #summary-bit {
                border-left: 1em solid orange;
                padding-left: 3em;

                div {
                    padding: 3px 5px;
                    background-color: #343434;
                }
            }
            
            #description-text {
                padding: 1em;
                border-radius: 5px;
                background-color: #1e1e1e;

                #big-picture {
                    width: 60%;
                    margin: 0 20%;
                }

                .blurred {
                    filter: blur(40px);
                }
            }
        }
        
    }
    
    #top-title-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;

        &>* {
            padding: 0 1em;
        }
        
        .title {
            color: orange;
        }

        #uploader-author-area {
            height: fit-content;
            flex-grow: 0.5;

            border-collapse: collapse;
            text-align: center;

            tr {
                text-align: center;
            }
            
            img {
                float: left;
                height: 75px;
            }

            #user-pfp {
                border-radius: 5px;
            }
        }
        
    }
    
    main {
        min-height: 100vh;
        padding: 1em;

        background-color: #1a1a1a;
        color: white;
    }
</style>