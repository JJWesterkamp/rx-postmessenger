export function* GUIDGeneratorMock() {
    let i = 1;
    while (true) {
        yield i.toString();
        i++;
    }
}
