export const getExcelData = () => { 
    const raw = localStorage.getItem('excelData');
    return raw ? JSON.parse(raw) : null;
};

export const setCookie = (key, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
};

export const getCookie = (key) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [k, v] = cookie.trim().split('=');
        if (k === key) return v;
    }
    return null;
};

export const clearCookies = () => {
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });
};

export const extractShopName = (data) => {
    const locationEntry = data.find(item =>
        item["Inventory Status"]?.startsWith('Locations:')
    );

    return locationEntry
        ? locationEntry["Inventory Status"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'
        : 'Unknown_Shop';
};
