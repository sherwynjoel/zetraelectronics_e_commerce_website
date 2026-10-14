import { lensBackground } from "./loupe-math";

test("centres the magnified point under the lens", () => {
  const r = lensBackground({ x: 100, y: 50, width: 400, height: 300, zoom: 2.5, lens: 160 });
  expect(r.size).toBe("1000px 750px");
  expect(r.position).toBe("-170px -45px");
});

test("clamps pointer to the image bounds", () => {
  const r = lensBackground({ x: -40, y: 900, width: 400, height: 300, zoom: 2, lens: 100 });
  expect(r.position).toBe("50px -550px");
});
