export class Objects {
    public static isEmpty(obj: object): boolean {
        if (obj == null || typeof obj === 'string') {
            return true;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    }
}
