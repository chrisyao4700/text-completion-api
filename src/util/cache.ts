let map: Map<string, boolean> | null = null;
export const getCacheMap = (): Map<string, boolean> => {
    if (map === null) {
        map = new Map();
    }
    return map;
}