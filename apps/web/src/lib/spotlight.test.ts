import { pickSpotlight } from "./spotlight";

const p = (id: number, image: string | null, stock: number) => ({ id, image, stock });

test("prefers in-stock parts with a photo, keeps catalogue order, caps the count", () => {
  const list = [p(1, "a.jpg", 0), p(2, null, 9), p(3, "c.jpg", 4), p(4, "d.jpg", 2), p(5, "e.jpg", 1), p(6, "f.jpg", 3), p(7, "g.jpg", 8)];
  expect(pickSpotlight(list, 5).map((x) => x.id)).toEqual([3, 4, 5, 6, 7]);
});

test("tops up with out-of-stock parts that have photos, never parts without one", () => {
  const list = [p(1, "a.jpg", 0), p(2, null, 9), p(3, "c.jpg", 4)];
  expect(pickSpotlight(list, 5).map((x) => x.id)).toEqual([3, 1]);
});

test("returns nothing when no part has a photo", () => {
  expect(pickSpotlight([p(1, null, 3)], 5)).toEqual([]);
});
