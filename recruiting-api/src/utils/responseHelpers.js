export const parseQueryParams = (req) => {
    return {
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0,
    };
};

export const validateLimit = (limit) => {
    const parsed = parseInt(limit);
    if (isNaN(parsed) || parsed < 1) return 100;
    if (parsed > 1000) return 1000;
    return parsed;
};

export const validateOffset = (offset) => {
    const parsed = parseInt(offset);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
};

export const createSuccessResponse = (data, message = "Success") => {
    return {
        status: "success",
        message,
        data,
    };
};

export const createErrorResponse = (message, statusCode = 400) => {
    return {
        status: "error",
        message,
    };
};