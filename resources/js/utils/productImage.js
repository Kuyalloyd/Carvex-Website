export const FALLBACK_PRODUCT_IMAGE = '/images/carvex.png';

const IMAGE_OBJECT_KEYS = ['url', 'path', 'src', 'image', 'image_url'];

const extractImageCandidate = (value) => {
    if (!value) {
        return '';
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const candidate = extractImageCandidate(item);
            if (candidate) {
                return candidate;
            }
        }
        return '';
    }

    if (typeof value === 'object') {
        for (const key of IMAGE_OBJECT_KEYS) {
            const candidate = extractImageCandidate(value[key]);
            if (candidate) {
                return candidate;
            }
        }
        return '';
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return '';
        }

        const looksLikeJson =
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('{') && trimmed.endsWith('}'));

        if (looksLikeJson) {
            try {
                const parsed = JSON.parse(trimmed);
                const candidate = extractImageCandidate(parsed);
                if (candidate) {
                    return candidate;
                }
            } catch (error) {
                // Fall through and treat as plain string.
            }
        }

        return trimmed;
    }

    return '';
};

const normalizeImagePath = (input) => {
    let path = String(input).trim().replace(/\\/g, '/');
    if (!path) {
        return '';
    }

    if (/^(https?:|data:|blob:)/i.test(path)) {
        return path;
    }

    if (path.startsWith('//')) {
        return `https:${path}`;
    }

    path = path.replace(/^\.\/+/, '');
    path = path.replace(/^\/?public\//i, '/');
    path = path.replace(/^\/?storage\/app\/public\//i, '/storage/');
    path = path.replace(/^\/?public\/storage\//i, '/storage/');
    path = path.replace(/^\/?public\/images\//i, '/images/');
    path = path.replace(/^\/?images\//i, '/images/');
    path = path.replace(/^\/?storage\//i, '/storage/');

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return path;
};

const safelyEncodeUri = (value) => {
    try {
        return encodeURI(value);
    } catch (error) {
        return value;
    }
};

export const resolveProductImage = (value) => {
    const candidate = extractImageCandidate(value);
    if (!candidate) {
        return FALLBACK_PRODUCT_IMAGE;
    }

    const normalized = normalizeImagePath(candidate);
    if (!normalized) {
        return FALLBACK_PRODUCT_IMAGE;
    }

    return safelyEncodeUri(normalized);
};
