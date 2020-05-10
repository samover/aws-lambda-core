import * as Logger from 'bunyan';

const { LOG_LEVEL } = process.env;
const getLogLevel = (): Logger.LogLevel => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (process.env.LOG_LEVEL && Logger.levelFromName[LOG_LEVEL]) { return process.env.LOG_LEVEL as Logger.LogLevel; }
    return Logger.INFO;
};

export const LOGGER: Logger = Logger.createLogger({
    level: getLogLevel(),
    name: 'AWS Lambda Helper',
});
