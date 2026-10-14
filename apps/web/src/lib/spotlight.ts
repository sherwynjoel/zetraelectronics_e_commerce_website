/** Parts for the home hero: in-stock parts with a photo first (catalogue order), then photographed parts that are out of stock. */
export function pickSpotlight<T extends { image?: string | null; stock: number }>(products: T[], max = 5): T[] {
  const withPhoto = products.filter((p) => !!p.image);
  const inStock = withPhoto.filter((p) => p.stock > 0);
  const rest = withPhoto.filter((p) => p.stock <= 0);
  return [...inStock, ...rest].slice(0, max);
}
