export function lensBackground({
  x,
  y,
  width,
  height,
  zoom,
  lens,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  lens: number;
}) {
  const cx = Math.min(Math.max(x, 0), width);
  const cy = Math.min(Math.max(y, 0), height);
  return {
    size: `${width * zoom}px ${height * zoom}px`,
    position: `${-(cx * zoom - lens / 2)}px ${-(cy * zoom - lens / 2)}px`,
  };
}
