// Holds the loaded Excel data for access by getExcelData()
let cachedExcelData = null;

// Your Apps Script endpoint for the SHOPS folder
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVpNVILkwnbN3ajlUPFSUSITudIIsL83CHgIRJh6TEOc6rI53qj7h4jtaPRLrfCbfteA/exec';

/**
 * Fetches Excel JSON data from SHOPS folder via Apps Script JSONP.
 * Caches it for repeated calls.
 * @param {string} filename - the file in SHOPS folder
 */
export const fetchExcelDataFromShops = (filename) => {
    return new Promise((resolve, reject) => {
        if (cachedExcelData) {
            console.log('[data.js] Returning cached data');
            return resolve(cachedExcelData);
        }

        console.log(`[data.js] fetchExcelDataFromShops called with filename: ${filename}`);

        // Create unique callback name
        const callbackName = `handleShopExcel_${Date.now()}`;
        window[callbackName] = (response) => {
            console.log('[data.js] JSONP callback triggered', response);

            try {
                if (response.error) {
                    console.error('[data.js] Error from Apps Script:', response.error);
                    resolve(null);
                } else {
                    // Decode base64 Excel
                    if (response.base64) {
                        const bytes = Uint8Array.from(atob(response.base64), c => c.charCodeAt(0));
                        const workbook = XLSX.read(bytes, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        cachedExcelData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                    } else if (response.data) {
                        cachedExcelData = response.data;
                    } else {
                        cachedExcelData = null;
                    }
                    resolve(cachedExcelData);
                }
            } catch (err) {
                console.error('[data.js] Failed to parse Excel data:', err);
                resolve(null);
            } finally {
                // Clean up
                delete window[callbackName];
                script.remove();
            }
        };

        // Construct URL with JSONP callback
        const url = `${APPS_SCRIPT_URL}?filename=${encodeURIComponent(filename)}&mode=main&callback=${callbackName}`;
        console.log('[data.js] Fetching URL:', url);

        // Inject script tag to perform JSONP request
        const script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);
    });
};

/**
 * Sets the Excel JSON data manually
 * @param {Array|Object} data 
 */
export const setExcelData = (data) => {
    cachedExcelData = data;
    localStorage.setItem('excelData', JSON.stringify(data));
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
 * Sets a cookie with a specific key, value, and expiry in hours
 */
export const setCookie = (key, value, hours) => {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
};

/**
 * Gets a cookie value
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
 * Clears cookies for a specific mode
 */
export const clearCookies = (mode) => {
    const prefix = mode + "Count_";
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name === "userpass" || name === "authToken") return;
        if (name.startsWith(prefix)) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        }
    });
};

/**
 * Extracts the shop name from loaded data
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
