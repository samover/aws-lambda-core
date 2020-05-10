export class Promises {
    /** Resolves a promise array sequentially, instead of parallel */
    public static resolvePromiseChain(tasks: any): any {
        return tasks.reduce(
            (promiseChain: any, currentTask: any) => promiseChain.then((chainResults: any) => currentTask()
                .then((currentResult: any) => [...chainResults, currentResult])),
            Promise.resolve([]),
        );
    }
}
