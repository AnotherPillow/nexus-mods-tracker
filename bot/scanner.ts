import EncodedDescriptionScannerJuly2025 from "./scanners/2025-07-encoded-description";
import { Flag } from "./scanners/Base";

const scannerList = [
    EncodedDescriptionScannerJuly2025
]

export default async function scanDll(dllPath: string, manifestPath: string, manifest: Record<string, any>): Promise<{ flags: Flag[], failedScans: string[] }> {
    let flags: Flag[] = []
    const failedScans: string[] = []

    for (const Scanner of scannerList) {
        const instance = new Scanner(dllPath, manifestPath, manifest)
        const result = await instance.scan()
        if (!result) {
            console.warn(`Failed to scan ${manifest.UniqueID} with ${Scanner.name}`)
            failedScans.push(Scanner.name)
            continue
        }
        console.log('Got ', result, ' from ', Scanner.name)
        flags = [ ...flags, ...result!]
    }

    return {
        flags, failedScans
    }
}