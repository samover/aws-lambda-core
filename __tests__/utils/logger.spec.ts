import * as Logger from 'bunyan';
process.env.LOG_LEVEL = null;

jest.mock('../../src/utils/logger');

describe('LOGGER', () => {
    afterEach(() => {
        jest.resetModules();
    });
    it('has a default logLevel', () => {
        const { LOGGER } = jest.requireActual('../../src/utils/logger');
        expect(LOGGER.level()).toEqual(Logger.INFO);
    });
    it('has a default logName', () => {
        const { LOGGER } = jest.requireActual('../../src/utils/logger');
        expect(LOGGER.fields.name).toEqual('AWS Lambda Helper');
    });
    it('takes logLevel from env variable', () => {
        process.env.LOG_LEVEL = 'trace';
        const { LOGGER } = jest.requireActual('../../src/utils/logger');
        expect(LOGGER.level()).toEqual(Logger.TRACE);
    });
    it('takes default logLevel if env logLevel is bogus', () => {
        process.env.LOG_LEVEL = 'null';
        const { LOGGER } = jest.requireActual('../../src/utils/logger');
        expect(LOGGER.level()).toEqual(Logger.INFO);
    })
});
