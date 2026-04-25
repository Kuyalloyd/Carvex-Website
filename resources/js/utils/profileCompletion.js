export const normalizeProfile = (user = {}) => {
    const source = user?.customer_info && typeof user.customer_info === 'object'
        ? { ...user, ...user.customer_info }
        : user;

    const fallbackAddress = source?.address || '';

    return {
        ...source,
        avatar_url: source?.avatar_url || '',
        name: source?.name || '',
        email: source?.email || '',
        phone: source?.phone || '',
        address: source?.address || fallbackAddress || '',
        billing_address: source?.billing_address || fallbackAddress || '',
        shipping_address: source?.shipping_address || fallbackAddress || '',
        payment_method: source?.payment_method || '',
        city: source?.city || '',
        region: source?.region || source?.state || '',
        postal_code: source?.postal_code || '',
    };
};

const REQUIRED_FIELDS = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone number' },
    { key: 'address', label: 'Address' },
];

export const getMissingProfileFields = (user = {}) => {
    const profile = normalizeProfile(user);

    return REQUIRED_FIELDS
        .filter((field) => !String(profile[field.key] || '').trim())
        .map((field) => field.label);
};

export const getProfileCompletion = (user = {}) => {
    const profile = normalizeProfile(user);
    const completed = REQUIRED_FIELDS.filter((field) => String(profile[field.key] || '').trim()).length;
    return Math.round((completed / REQUIRED_FIELDS.length) * 100);
};

export const isProfileComplete = (user = {}) => getMissingProfileFields(user).length === 0;
