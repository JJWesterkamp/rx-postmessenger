export function createIFrame(url: string = "about:blank"): HTMLIFrameElement {
    const frame = document.createElement("iframe");
    frame.src = url;
    document.body.appendChild(frame);
    return frame;
}
