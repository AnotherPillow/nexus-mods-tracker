export type ModStatus = 'published' | 'removed' | 'wastebinned' | 'not_published'
// Yes I wrote this myself
export interface DatabaseMod {
    uid: number,
    name?: string,
    summary?: string,
    description?: string,
    picture_url?: string,
    mod_downloads?: number,
    mod_unique_downloads?: number,
    mod_id: number,
    domain_name: string,
    version: string,
    endorsement_count: number,
    created_timestamp: number,
    created_time: string,
    updated_timestamp: number,
    updated_time: string,
    author: string,
    uploaded_by: string,
    uploaded_users_profile_url: string,
    contains_adult_content: 0 | 1,
    status: ModStatus,
    author_id: number,
    filesB64: string,
}

// I typed this out impressively fast, wow.
export interface ModFile {
    id: number[],
    uid: number,
    file_id: number,
    name: string,
    version: string,
    category_id: number,
    category_name: string,
    is_primary: boolean,
    size: number,
    file_name: string,
    uploaded_timestamp: number,
    uploaded_time: string,
    mod_version: string,
    external_virus_scan_url: string,
    description: string,
    size_kb: string,
    size_in_bytes: string,
    changelog_html: string,
    content_preview_link: string
}