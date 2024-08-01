export async function VOICEVOXTTS(text: string) {
    const req = await fetch(`/tts`, {
        method: 'POST',
        body: text
    });
    const audio = await req.arrayBuffer();

    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('audio')) {
        throw new Error(`Unexpected content type: ${contentType}`);
    }

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();

    const audioBuffer = await (new Promise((res, rej) => {
        context.decodeAudioData(audio, res, rej);
    }));

    if (!audioBuffer) return;

    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(context.destination);
    source.start(0);
}