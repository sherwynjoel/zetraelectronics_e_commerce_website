import { pickRelated } from "./related";

const cats = [
  { id: 15, name: "Development Boards & Prototyping", parentId: null },
  { id: 16, name: "ARDUINO", parentId: 15 },
  { id: 20, name: "ESP32 DEVKIT-1 MODULE", parentId: 15 },
  { id: 35, name: "SENSORS ", parentId: null },
  { id: 36, name: "ULTRASONIC SENSOR HC-SR04", parentId: 35 },
];
const p = (id: number, category: string, stock = 5, image: string | null = "x.png") => ({ id, category, stock, image });

test("same category first, then the rest of its group, never the part itself", () => {
  const all = [p(1, "ARDUINO"), p(2, "ESP32 DEVKIT-1 MODULE"), p(3, "arduino "), p(4, "SENSORS"), p(5, "Development Boards & Prototyping")];
  expect(pickRelated(all[0], all, cats, { min: 0 }).map((x) => x.id)).toEqual([3, 2, 5]);
  // With the default minimum of 4, a thin group is topped up from elsewhere.
  expect(pickRelated(all[0], all, cats).map((x) => x.id)).toEqual([3, 2, 5, 4]);
});

test("a parent category relates to its children", () => {
  const all = [p(1, "SENSORS "), p(2, "ULTRASONIC SENSOR HC-SR04"), p(3, "ARDUINO")];
  expect(pickRelated(all[0], all, cats, { min: 0 }).map((x) => x.id)).toEqual([2]);
});

test("in-stock parts with photos lead within a tier; keeps catalogue order otherwise", () => {
  const all = [p(1, "ARDUINO"), p(2, "ARDUINO", 0), p(3, "ARDUINO", 4, null), p(4, "ARDUINO"), p(5, "ARDUINO")];
  expect(pickRelated(all[0], all, cats).map((x) => x.id)).toEqual([4, 5, 3, 2]);
});

test("tops up from other categories only when the group is thin, and caps the count", () => {
  const all = [p(1, "ULTRASONIC SENSOR HC-SR04"), p(2, "ARDUINO"), p(3, "ARDUINO", 0), p(4, "ESP32 DEVKIT-1 MODULE")];
  // Group has nothing but the parent tier is empty; fill with in-stock parts from elsewhere.
  expect(pickRelated(all[0], all, cats, { max: 8, min: 2 }).map((x) => x.id)).toEqual([2, 4]);
  const many = Array.from({ length: 20 }, (_, i) => p(i + 1, "ARDUINO"));
  expect(pickRelated(many[0], many, cats)).toHaveLength(8);
});
