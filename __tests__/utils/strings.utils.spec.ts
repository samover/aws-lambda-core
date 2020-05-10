import { Strings } from '../../src/utils';

describe('utils/Strings', () => {
    let randomObject: { [key: string]: any };

    beforeEach(() => {
        randomObject = { key1: 'string', key2: true };
    });

    describe('commaSeparatedList', () => {
        it('converts a commaSeparated string to a list', async () => {
            const result = Strings.toList('hello,world');
            expect(result).toEqual(['hello', 'world']);
        });
        it('ignores sequential commas', async () => {
            const result = Strings.toList('hello,world,,,');
            expect(result).toEqual(['hello', 'world']);
        });
        it('trims string', async () => {
            const result = Strings.toList('hello  , world   ');
            expect(result).toEqual(['hello', 'world']);
        });
    });
    describe('makeLowerCamelCase', () => {
        it('converts spaced string into lowercase camelCased string', async () => {
            const result = Strings.makeLowerCamelCase('Live long and Prosper');
            expect(result).toEqual('live_long_and_prosper');
        });
    });

    describe('encode', () => {
        it('converts a string to a base64 encoded string', () => {
            const encoded = Strings.encode('encode-me');
            expect(typeof encoded).toEqual('string');
            expect(Buffer.from(encoded, 'base64').toString()).toEqual('encode-me');
        });
        it('converts an object to a base64 encoded string', () => {
            const encoded = Strings.encode({ hello: 'world' });
            expect(typeof encoded).toEqual('string');
            expect(Buffer.from(encoded, 'base64').toString()).toEqual(JSON.stringify({ hello: 'world' }));
        });
        it('returns empty string if no payload is passsed', () => {
            // @ts-ignore
            const encoded = Strings.encode();
            expect(typeof encoded).toEqual('string');
            expect(Buffer.from(encoded, 'base64').toString()).toEqual('');
        });
    });

    describe('decode', () => {
        it('converts a base64 string to a JSON object', () => {
            const encoded = Strings.encode(randomObject);
            expect(Strings.decode(encoded)).toEqual(randomObject);
        });
        it('returns empty string if no payload is passsed', () => {
            // @ts-ignore
            expect(Strings.decode()).toBeNull();
        });
        it('throws if trying to parse a non json object payload', () => {
            const encoded = Strings.encode('a random word');
            expect(() => Strings.decode(encoded)).toThrow();
        });
    });
});
