import type { ModStatus } from "./types"

export const humanReadableStatus = (status: ModStatus) => {
    switch (status) {
        case 'not_published':
            return 'Unpublished'
        case 'published':
            return 'Published'
        case 'removed':
            return 'Removed by uploader'
        case 'wastebinned':
            return 'Removed by staff'
        default:
            return 'Unknown'
    }
}