export class Objects {
    public static isEmpty(obj: object) {
        if (obj == null || typeof obj === 'string') {
            return true;
        }

        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    }
}
