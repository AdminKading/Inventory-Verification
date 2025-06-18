// Holds the loaded Excel data for access by getExcelData()
let cachedExcelData = null;

/**
 * Sets the Excel JSON data (e.g., from JSONP or localStorage)
 * @param {Array|Object} data 
 */
export const setExcelData = (data) => {
    cachedExcelData = data;
};

/**
 * Returns the currently loaded Excel JSON data
 * @returns {Array|Object|null}
 */
export const getExcelData = () => {
    if (cachedExcelData) return cachedExcelData;
    const raw = localStorage.getItem('excelData');
    return raw ? JSON.parse(raw) : null;
};

/**
 * Sets a cookie with a specific key, value, and expiry in days
 * @param {string} key 
 * @param {string|number} value 
 * @param {number} days 
 */
export const setCookie = (key, value, days) => {
    if (!key.startsWith('InventoryCount_') && !key.startsWith('RestockCount_') &&
        key !== 'userpass' && key !== 'authToken') {
        console.warn(`Warning: setCookie called with unprefixed key: "${key}"`);
    }
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
};

/**
 * Gets the value of a cookie by key
 * @param {string} key 
 * @returns {string|null}
 */
export const getCookie = (key) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [k, v] = cookie.trim().split('=');
        if (k === key) return v;
    }
    return null;
};

/**
 * Clears cookies based on mode (e.g. "Inventory" or "Restock")
 * @param {string} mode 
 */
export const clearCookies = (mode) => {
    const prefix = mode + "Count_";
    clearCookiesByPrefix(prefix);
};

/**
 * Clears cookies with a specific prefix
 * @param {string} prefix 
 */
export const clearCookiesByPrefix = (prefix) => {
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name === "userpass" || name === "authToken") return;
        if (name.startsWith(prefix)) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        }
    });
};

/**
 * Extracts the shop name from the loaded data, defaulting if missing.
 * Replaces spaces with underscores.
 * @param {Array} data 
 * @returns {string}
 */
export const extractShopName = (data) => {
    if (!data || !Array.isArray(data)) return 'Unknown_Shop';

    const locationEntry = data.find(item =>
        item["Inventory Status"]?.startsWith('Locations:')
    );

    return locationEntry
        ? locationEntry["Inventory Status"].split(': ')[1]?.trim().replace(/\s+/g, '_') || 'Unknown_Shop'
        : 'Unknown_Shop';
};
