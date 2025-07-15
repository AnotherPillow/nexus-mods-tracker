export interface GQLModNexus {
    adult: boolean,
    adultContent: boolean,
    author: string,
    createdAt: string, // iso timestamp
    description: string,
    downloads: number,
    endorsements: number,
    fileSize: number,
    gameId: number,
    id: string, // ${gameId},${modId}
    isBlockedFromEarningDp: null | any,
    modId: number,
    name: string,
    status: 'published' | string & {},
    summary: string,
    uid: string,
    updatedAt: string, // iso timestamp
    version: number,
    viewerBlocked: boolean,
    viewerDownloaded: null | any,
    viewerEndorsed: null | any,
    viewerTracked: boolean,
    viewerUpdateAvailable: null | any,
    category: string,
    picureUrl: string,
    thumbnailBlurredUrl: string,
    thumbnailLargeBlurredUrl: string,
    thumbnailLargeUrl: string,
    thumbnailUrl: string,
}

export interface GQLUserNexus {
    "about": string,
    "banned": boolean,
    "blockedFromOptingInModsAt": null | unknown,
    "collectionCount": number,
    "contributedModCount": number,
    "country": null | unknown,
    "deleted": boolean,
    "donationsEnabled": boolean,
    "dpOptedIn": boolean,
    "fullPageNotificationCount": null | unknown,
    "hasGivenKudos": boolean,
    "imageCount": number,
    "isBlocked": boolean,
    "isTracked": boolean,
    "joined": string, // iso timestamp
    "kudos": number,
    "lastActive": string, // iso timestamp
    "legacyRoles": unknown[],
    "memberId": number,
    "modCount": number,
    "moderationHistoryCount": null | unknown,
    "moderationJwt": string, // should this be shared?
    "name": string,
    "ownedModCount": number,
    "posts": number,
    "recognizedAuthor": boolean,
    "showActivityFeed": boolean,
    "showLastActive": boolean,
    "videoCount": number,
    "viewerHasBlocked": boolean,
    "viewerHasIgnored": boolean,
    "views": number,
    "avatar": string,
    "endorsementsGiven": number,
    "membershipRoles": (('member' | 'supporter') & string)[],
    "roles": unknown[],
    "uniqueModDownloads": number,
}

export type FileNode = {
    path: string;
    name: string;
    type: 'file' | 'directory';
    size?: string;
    children?: FileNode[];
};

export type ElementType<T> = T extends (infer U)[] ? U : never;
export type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type UnwrappedReturnType<T extends (...args: any[]) => any> = UnwrapPromise<ReturnTypeOf<T>>;