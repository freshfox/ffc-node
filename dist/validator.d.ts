export declare class Validator {
    /**
     * Validates a given data set against the rules
     * @param rules
     * @param data
     * @return {Promise}
     */
    static validate(rules: any, data: any): any;
    static register(name: any, callback: any): void;
    private static createError(err);
}