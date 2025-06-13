const INVALID_NAMES = new Set([
    "chainsaws", "dewalt light", "drill (impact)", "drill (regular)", "multi-tool",
    "post hole diggers", "push lawn mower", "sawzall", "skillsaw", "snow blower",
    "snow shovels", "speed bumps", "sprayer backpacks", "stihl bf-km",
    "stihl blowers", "weed whips"
]);

export const filterValidRows = (rows) => {
    return rows.slice(1).filter(row => {
        const name = row["__EMPTY"]?.trim().toLowerCase();
        const qty = parseInt(row["__EMPTY_9"], 10);
        const restock = parseInt(row["__EMPTY_10"], 10);
        return (
            name &&
            !INVALID_NAMES.has(name) &&
            !name.startsWith("zz") &&
            !name.includes("do not use") &&
            !name.includes("zzz") &&
            !isNaN(qty) &&
            !isNaN(restock) &&
            qty <= restock
        );
    });
};
