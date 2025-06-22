// Helper to normalize names: lowercase, collapse spaces, trim
const normalizeName = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();

// Build INVALID_NAMES set with normalized names
const INVALID_NAMES = new Set([
    "chainsaws",
    "dewalt light",
    "drill (impact)",
    "drill (regular)",
    "multi-tool",
    "post hole diggers",
    "push lawn mower",
    "sawzall",
    "skillsaw",
    "snow blower",
    "snow shovels",
    "speed bumps",
    "sprayer backpacks",
    "stihl bf-km",
    "stihl blowers",
    "weed whips",
    "hedge trimmer",
    "kubota lawnmower",
    "mailbox lock c9100",
    "pole saw",
    "z-spray max",
    "10 gallon dogipot trashbags (1 unit = 1 box)",
    "42 gallon wing-tie contractor trash bags",
    "master key locking mechanisms (deadbolts)",
    "trim nailer",
    "jelly jar replacement",
    "6 ft orange ladder",
    "6ft tall yellow scaffolding",
    "post pounder",
    "push broom",
    "shop vac small",
    "shop-vac large",
    "sledgehammer",
    "small pick-up dogipot bags (1 unit = 1 roll)",
    "snow plow",
    "timmer-235e",
    "snow plow #47e & 105e"
].map(normalizeName));

export const filterValidRows = (rows, mode = 'Inventory') => {
    return rows.slice(1).filter(row => {
        const rawName = row["__EMPTY"] ?? '';
        const name = normalizeName(rawName);
        const qty = parseInt(row["__EMPTY_9"], 10);
        const restock = parseInt(row["__EMPTY_10"], 10);

        // Basic validation
        const isValidName = (
            name &&
            !INVALID_NAMES.has(name) &&
            !name.startsWith("zz") &&
            !name.includes("do not use") &&
            !name.includes("zzz")
        );

        const hasValidQty = !isNaN(qty);
        const hasValidRestock = !isNaN(restock);

        console.log(`Row: "${rawName}" -> "${name}" | Valid: ${isValidName}`);

        if (mode === 'Restock') {
            return isValidName && hasValidQty && hasValidRestock && qty <= restock;
        }

        // For Inventory mode, we don't care about restock level
        return isValidName && hasValidQty;
    });
};
