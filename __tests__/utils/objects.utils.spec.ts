import { Objects } from '../../src/utils';

describe('utils/Objects', () => {
    describe('isEmpty', () => {
        it('returns true when object is null', () => {
            // @ts-ignore
            expect(Objects.isEmpty()).toBeTruthy();
        });
        it('returns true when object is a string', () => {
            // @ts-ignore
            expect(Objects.isEmpty('string')).toBeTruthy();
        });
        it('returns true when object is a number', () => {
            // @ts-ignore
            expect(Objects.isEmpty(123)).toBeTruthy();
        });
        it('returns true when object is a boolean', () => {
            // @ts-ignore
            expect(Objects.isEmpty(true)).toBeTruthy();
            // @ts-ignore
            expect(Objects.isEmpty(false)).toBeTruthy();
        });
        it('returns true when object is an empty array', () => {
            expect(Objects.isEmpty([])).toBeTruthy();
        });
        it('returns true when object is an empty object', () => {
            expect(Objects.isEmpty({})).toBeTruthy();
        });
        it('returns false when object is an array with data', () => {
            expect(Objects.isEmpty([1, 2])).toBeFalsy();
        });
        it('returns true when object is an object with data', () => {
            expect(Objects.isEmpty({ key: 'value' })).toBeFalsy();
        });
        it('returns true for an object with no own properties', () => {
            const triangle = { a: 1, b: 2, c: 3 };
            function ColoredTriangle() {}
            ColoredTriangle.prototype = triangle;
            // @ts-ignore
            expect(Objects.isEmpty(new ColoredTriangle())).toBeTruthy();
        });
    });
});
