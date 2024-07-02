export type ModStatus = 'published' | 'removed' | 'wastebinned' | 'not_published'
// Yes I wrote this myself
export interface SuccessfulMod {
    name?: string,
    summary?: string,
    description?: string,
    picture_url?: string,
    mod_downloads?: number,
    mod_unique_downloads?: number,
    uid: number,
    mod_id: number,
    game_id: number,
    allow_rating: boolean,
    domain_name: string,
    category_id: number,
    version: string,
    endorsement_count: number,
    created_timestamp: number,
    created_time: string,
    updated_timestamp: number,
    updated_time: string,
    author: string,
    uploaded_by: string,
    uploaded_users_profile_url: string,
    contains_adult_content: boolean,
    status: ModStatus,
    available: boolean,
    user: {
        member_id: number,
        member_group_id: number,
        name: string,
    },
    endorsement: null | {
        endorse_status: string,
        timestamp: null | number,
        version: null | number
    }
}

export type ModError = {
    error: string
}

export type Mod = SuccessfulMod | ModError

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
    sizee_kb: string,
    size_in_bytes: string,
    changelog_html: string,
    content_preview_link: string
}