class BaseService {
    constructor() {
        // Shared core logic for all services
    }

    // Common helper methods
    camelize(obj) {
        if (Array.isArray(obj)) {
            return obj.map(v => this.camelize(v));
        } else if (obj != null && obj.constructor === Object) {
            return Object.keys(obj).reduce(
                (result, key) => ({
                    ...result,
                    [key.replace(/(_\w)/g, m => m[1].toUpperCase())]: this.camelize(obj[key]),
                }),
                {},
            );
        }
        return obj;
    }
}

module.exports = BaseService;
