let map: Map<string, number> | null = null;
export const getCacheMap = (): Map<string, number> => {
    if (map === null) {
        map = new Map();
    }
    return map;
}
let resMap: Map<string, string> | null = null;
export const getCacheResultMap = (): Map<string, string> => {
    if (resMap === null) {
        resMap = new Map();
    }
    return resMap;
}
