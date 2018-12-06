export function* GUIDGenerator() {
    const s4 = (): string => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    const IDSegment = (size: number = 1) => Array(size).fill(null).map(s4).join('');
    const guid: () => string = () => [
        IDSegment(2),
        IDSegment(),
        IDSegment(),
        IDSegment(),
        IDSegment(3),
    ].join('-');

    while (true) {
        yield guid();
    }
}
