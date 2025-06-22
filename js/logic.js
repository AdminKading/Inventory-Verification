const INVALID_NAMES = new Set([
    "chainsaws", "dewalt light", "drill (impact)", "drill (regular)", "multi-tool",
    "post hole diggers", "push lawn mower", "sawzall", "skillsaw", "snow blower",
    "snow shovels", "speed bumps", "sprayer backpacks", "stihl bf-km",
    "stihl blowers", "weed whips"
]);

export const filterValidRows = (rows, mode = 'Inventory') => {
    return rows.slice(1).filter(row => {
        const name = row["__EMPTY"]?.trim().toLowerCase();
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

        if (mode === 'Restock') {
            return isValidName && hasValidQty && hasValidRestock && qty <= restock;
        }

        // For Inventory mode, we don't care about restock level
        return isValidName && hasValidQty;
    });
};
