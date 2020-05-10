export type MockOf<Class, Omit extends keyof Class = never> = {
    [Member in Exclude<keyof Class, Omit>]: Class[Member];
}

