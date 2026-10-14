import { useFavorites, ownerKey } from "./favorites";

beforeEach(() => useFavorites.setState({ byOwner: {} }));

test("owner key separates guests and signed-in accounts", () => {
  expect(ownerKey(null)).toBe("guest");
  expect(ownerKey({ id: 7 })).toBe("user:7");
});

test("toggle adds and removes a product for one owner only", () => {
  const { toggle } = useFavorites.getState();
  expect(toggle("user:7", 3)).toBe(true);
  expect(useFavorites.getState().byOwner["user:7"]).toEqual([3]);
  expect(useFavorites.getState().byOwner["guest"]).toBeUndefined();
  expect(toggle("user:7", 3)).toBe(false);
  expect(useFavorites.getState().byOwner["user:7"]).toEqual([]);
});

test("guest favourites merge into an account on sign-in without duplicates", () => {
  const s = useFavorites.getState();
  s.toggle("guest", 1);
  s.toggle("guest", 2);
  s.toggle("user:7", 2);
  useFavorites.getState().mergeGuestInto("user:7");
  expect(useFavorites.getState().byOwner["user:7"]).toEqual([2, 1]);
  expect(useFavorites.getState().byOwner["guest"]).toEqual([]);
});
