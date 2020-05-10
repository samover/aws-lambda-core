export class Strings {
    /** Converts comma separated string into a trimmed list */
    public static toList(commaSeparatedList: string): string[] {
        return commaSeparatedList
            .split(',')
            .map((p) => p.trim())
            .filter((i) => i != null && i !== '');
    }

    /** Converts space separated words into a lowercase camelcased string */
    public static makeLowerCamelCase(s: string): string {
        return s.replace(/\s/g, '_').toLowerCase();
    }

    /**
     * Encodes a payload of type T to "base64"
     * @typeparam T Payload type
     */
    public static encode<T>(payload: T): string {
        if (!payload) {
            return '';
        }
        const payloadString: string = (typeof payload === 'string' ? payload : JSON.stringify(payload)) as string;
        return Buffer.from(payloadString, 'utf8').toString('base64');
    }

    /**
     * Decodes a base64 encoded string to a payload of type T
     * @typeparam T Payload type
     * @throws {Error} Failure to parse payload to JSON object
     */
    public static decode<T>(encoded: string): T {
        if (!encoded) { return null; }
        const decoded: string = Buffer.from(encoded, 'base64').toString('utf8');
        try {
            const payload: T = JSON.parse(decoded) as T;
            return payload;
        } catch (e) {
            throw new Error('Failed parsing payload');
        }
    }
}
