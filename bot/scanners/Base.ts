export class Flag {
    constructor(public name: string, public description: string) {}
}

export abstract class Scanner {
    public flags: Flag[] = []
    
    constructor(protected dllPath: string, protected manifestPath: string, protected manifest: Record<string, any>) {}

    async scan(): Promise<null | Flag[]> { return null }
}