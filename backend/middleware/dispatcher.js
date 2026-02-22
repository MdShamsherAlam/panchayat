const statusCodes = require('../utils/status-codes');

/**
 * Centrally handle all controller requests
 */
const dispatcher = async (req, res, next, controllerMethod) => {
    try {
        const data = await controllerMethod(req, res, next);

        // Automatic camelization of response data
        const camelizedData = camelize(data);
        const requestId = req.headers['x-request-id'] || 'N/A';

        res.status(statusCodes.OK).json({
            success: true,
            requestId: requestId,
            data: camelizedData,
        });
    } catch (error) {
        next(error);
    }
};

const camelize = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => camelize(v));
    } else if (obj != null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [key.replace(/(_\w)/g, m => m[1].toUpperCase())]: camelize(obj[key]),
            }),
            {},
        );
    }
    return obj;
};

module.exports = dispatcher;
