import { Flag, Scanner } from "./Base";
import dedent from 'dedent'

export default class EncodedDescriptionScannerJuly2025 extends Scanner {

    constructor(dllPath: string, manifestPath: string, manifest: Record<string, any>) {
        super(dllPath, manifestPath, manifest);
    }
    async scan() {
        const dll = await Bun.file(this.dllPath).text()
        const dashedDescription = dll.match(/((?:\d+\-)+\d{1,3})/)
        console.log(dashedDescription?.[1] ?? ' no found ')
        if (dashedDescription == null) return null

        const decodedText = dashedDescription[1].split('-').map(x => String.fromCharCode(Number(x))).join('').replaceAll('`', '\n') // ` is deliminator between parts in what we've seen
        
        return [ new Flag('⚠️ Malicious Encoded Description', dedent`
            AssemblyDescription is (shortened) \`${dashedDescription[1].slice(0, 100)}...\`
            Which decodes to: \`\`\`powershell
            ${decodedText}
            \`\`\`
        `) ]
    }
}