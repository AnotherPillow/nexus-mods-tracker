import { GQLModNexus, GQLUserNexus } from "./types"

const API_BASE = 'https://api.nexusmods.com/v2/graphql'

export interface QLReturnType<K extends string, T> {
    data: {
        [P in K]: {
            facetsData: {},
            nodesCount: number,
            nodesFilter: null | any,
            totalCount: number,
            nodes: T[]
        }
    }
}

export const _doFetch = async (query: string, operationName: string) => {
    const res = await fetch(API_BASE, {
        body: JSON.stringify({
            // yes i used httptoolkit on the postman agent for this
            query, variables: null, operationName: operationName  // make sure operationName is the thing on the nexus docs
        }),
        headers: {
            'Application-Name': 'mods.directory',
            "Content-Type": "application/json",
        },
        method: 'POST'
    })
    return await res.json()
}

export const getModsByAuthor = (author: string): Promise<QLReturnType<'mods', GQLModNexus>> => {
    const query = `query Mods {
        mods(
            filter: { gameDomainName: { value: "stardewvalley", op: EQUALS }, uploader: { value: "${author}", op: EQUALS } }
        ) {
            facetsData
            nodesCount
            nodesFilter
            totalCount
            nodes {
                adult
                adultContent
                author
                category
                createdAt
                description
                downloads
                endorsements
                fileSize
                gameId
                id
                isBlockedFromEarningDp
                modId
                name
                pictureUrl
                status
                summary
                thumbnailBlurredUrl
                thumbnailLargeBlurredUrl
                thumbnailLargeUrl
                thumbnailUrl
                uid
                updatedAt
                version
                viewerBlocked
                viewerDownloaded
                viewerEndorsed
                viewerTracked
                viewerUpdateAvailable
            }
        }
    }`
    
    const data = _doFetch(query, 'Mods')
    // data.then(({ data }) => console.log(data.mods.nodes))
    return data
}

export const getUserByName = (name: string): Promise<{ data: { userByName: GQLUserNexus } }> => {
    const query = `query User {
        userByName(name: "${name}") {
            about
            avatar
            banned
            blockedFromOptingInModsAt
            collectionCount
            contributedModCount
            country
            deleted
            donationsEnabled
            dpOptedIn
            endorsementsGiven
            fullPageNotificationCount
            hasGivenKudos
            imageCount
            isBlocked
            isTracked
            joined
            kudos
            lastActive
            legacyRoles
            memberId
            membershipRoles
            modCount
            moderationHistoryCount
            moderationJwt
            name
            ownedModCount
            posts
            recognizedAuthor
            roles
            showActivityFeed
            showLastActive
            uniqueModDownloads
            videoCount
            viewerHasBlocked
            viewerHasIgnored
            views
        }
    }
    `
    
    const data = _doFetch(query, 'User')
    // data.then(({ data }) => console.log(data.mods.nodes))
    return data
}