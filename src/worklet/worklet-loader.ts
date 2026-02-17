export async function loadYinWorkletModule(ctx: AudioContext): Promise<void> {
  await ctx.audioWorklet.addModule('/worklets/yin-processor.js');
}
