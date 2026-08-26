export function drawCoverCrop(
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  destWidth: number,
  destHeight: number,
): void {
  if (sourceWidth < 1 || sourceHeight < 1 || destWidth < 1 || destHeight < 1) {
    return;
  }

  const scale = Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const dx = (destWidth - drawWidth) / 2;
  const dy = (destHeight - drawHeight) / 2;
  context.drawImage(source, dx, dy, drawWidth, drawHeight);
}
