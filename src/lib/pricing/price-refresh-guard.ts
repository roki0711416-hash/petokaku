export const priceRefreshLockLeaseMs = 15 * 60 * 1000;

export type HeldPriceRefreshLock = {
  owner: string;
};

export async function runWithHeldLock<T>(input: {
  acquire: () => Promise<HeldPriceRefreshLock | null>;
  release: (lock: HeldPriceRefreshLock) => Promise<void>;
  work: () => Promise<T>;
}): Promise<{ acquired: false } | { acquired: true; value: T }> {
  const lock = await input.acquire();
  if (!lock) {
    return { acquired: false };
  }
  try {
    return { acquired: true, value: await input.work() };
  } finally {
    await input.release(lock);
  }
}
