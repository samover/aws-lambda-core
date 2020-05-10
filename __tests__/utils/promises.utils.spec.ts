import { Promises } from '../../src/utils';

describe('utils/Promises', () => {
    describe('resolvePromiseChain', () => {
        it('resolves a promiseChain', async () => {
            const tasks = [Promise.resolve(1), Promise.resolve(2)];
            const result = await Promises.resolvePromiseChain(tasks.map(t => () => t));
            expect(result).toEqual([1,2]);
        });
        it('resolves a promiseChain with errors', async () => {
            const resolved: any = {};
            const p1 = () => {
                resolved.p1 = true;
                return Promise.resolve();
            };
            const p2 = () => Promise.reject();
            const p3 = () => {
                resolved.p3 = true;
                return Promise.resolve();
            };

        const tasks = [p1, p2, p3];
            try {
                await Promises.resolvePromiseChain(tasks.map(t => () => t()));
            } catch (e) {
                // failed as expected
            }

            expect(resolved.p1).toBeTruthy();
            expect(resolved.p2).toBeUndefined();
            expect(resolved.p3).toBeUndefined();
        });
    });
});
