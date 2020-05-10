import { validate } from 'class-validator';
import { defaultValidatorOptions, ValidationClass } from '../../src/class-validator-wrapper';

jest.mock('class-validator');

describe('ValidationClass', () => {
    beforeEach(() => {
        // @ts-ignore
        validate.mockResolvedValue('validationResult');
    });
    afterEach(() => jest.clearAllMocks());
    afterAll(() => jest.restoreAllMocks());

    describe('#validate', () => {
        it('is a wrapper around class-validator.validate', async () => {
            const validator = new ValidationClass();
            await expect(validator.validate()).resolves.toEqual('validationResult');
        });
        it('uses default validationOptions', async () => {
            const validator = new ValidationClass();
            await validator.validate();
            expect(validate).toHaveBeenCalledWith(validator, defaultValidatorOptions);
        });
        it('default validationOptions can be overridden', async () => {
            const validator = new ValidationClass();
            await validator.validate({ forbidNonWhitelisted: false });
            expect(validate).toHaveBeenCalledWith(validator, { ...defaultValidatorOptions, forbidNonWhitelisted: false });
        })
    });
});
