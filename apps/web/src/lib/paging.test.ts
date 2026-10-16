import { fetchAllPages, PAGE_SIZE } from "./paging";

const items = (from: number, n: number) => Array.from({ length: n }, (_, i) => ({ id: from + i }));

test("keeps asking for pages until one comes back short", async () => {
  const asked: number[] = [];
  const all = await fetchAllPages(async (page) => {
    asked.push(page);
    return page === 1 ? items(1, PAGE_SIZE) : items(PAGE_SIZE + 1, 7);
  });
  expect(asked).toEqual([1, 2]);
  expect(all).toHaveLength(PAGE_SIZE + 7);
});

test("drops duplicates if the list shifts between pages", async () => {
  const all = await fetchAllPages(async (page) => (page === 1 ? items(1, PAGE_SIZE) : items(PAGE_SIZE, 3)));
  expect(all).toHaveLength(PAGE_SIZE + 2);
});

test("returns null when the first page fails, partial results when a later one does", async () => {
  expect(await fetchAllPages(async () => null)).toBeNull();
  expect(await fetchAllPages(async (page) => (page === 1 ? items(1, PAGE_SIZE) : null))).toHaveLength(PAGE_SIZE);
});

test("stops at the page cap", async () => {
  let calls = 0;
  await fetchAllPages(async (page) => {
    calls++;
    return items(page * PAGE_SIZE, PAGE_SIZE);
  }, 3);
  expect(calls).toBe(3);
});
