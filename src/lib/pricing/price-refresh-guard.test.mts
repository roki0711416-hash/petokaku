import assert from "node:assert/strict";
import test from "node:test";
import { priceRefreshLockLeaseMs, runWithHeldLock, type HeldPriceRefreshLock } from "./price-refresh-guard.ts";

test("ロックは15分で期限切れになり、永久には残らない", () => {
  assert.equal(priceRefreshLockLeaseMs, 15 * 60 * 1000);
});

test("ロックを取れないときは処理を始めない", async () => {
  let worked = 0;
  let released = 0;
  const result = await runWithHeldLock({
    acquire: async () => null,
    release: async () => {
      released += 1;
    },
    work: async () => {
      worked += 1;
      return "done";
    },
  });
  assert.deepEqual(result, { acquired: false });
  assert.equal(worked, 0);
  assert.equal(released, 0);
});

test("処理が例外でも取得したロックは解放する", async () => {
  const released: string[] = [];
  await assert.rejects(
    runWithHeldLock({
      acquire: async () => ({ owner: "run-1" }),
      release: async (lock: HeldPriceRefreshLock) => {
        released.push(lock.owner);
      },
      work: async () => {
        throw new Error("failed");
      },
    }),
  );
  assert.deepEqual(released, ["run-1"]);
});

test("同時に2回入っても、後から来た方は処理の前に断る", async () => {
  let holder: HeldPriceRefreshLock | null = null;
  let searches = 0;
  const acquire = async () => {
    if (holder) {
      return null;
    }
    holder = { owner: `run-${searches + 1}` };
    return holder;
  };
  const release = async (lock: HeldPriceRefreshLock) => {
    if (holder?.owner === lock.owner) {
      holder = null;
    }
  };
  const work = async () => {
    searches += 1;
    await new Promise((resolve) => setTimeout(resolve, 50));
    return searches;
  };
  const [first, second] = await Promise.all([
    runWithHeldLock({ acquire, release, work }),
    runWithHeldLock({ acquire, release, work }),
  ]);
  const acquired = [first, second].filter((result) => result.acquired);
  assert.equal(acquired.length, 1);
  assert.equal(searches, 1);
  assert.equal(holder, null);
});
