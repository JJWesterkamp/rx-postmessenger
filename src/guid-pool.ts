const usedIds: string[] = [];

/**
 *
 */
function s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

/**
 *
 */
function guid(): string {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-'
      + s4() + '-' + s4() + s4() + s4();
}

/**
 * @returns {string}
 */
export function generateGUID(): string {
    let id = guid();
    while (usedIds.indexOf(id) >= 0) id = guid();
    return id;
}

export function pushUsedGUID(id: string) {
    if (typeof id === 'string') {
        usedIds.push(id);
    }
}
