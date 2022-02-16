class Deferred<T> extends Promise<T> {
  #state: "pending" | "fulfilled" | "rejected";
  #resolve!: (value: T | PromiseLike<T>) => void;
  #reject!: (reason?: any) => void;

  constructor() {
    // assign to local variables first so we don't get errors about accessing
    // this before super is called
    let _resolve: (value: T | PromiseLike<T>) => void;
    let _reject: (reason?: any) => void;
    super((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    this.#resolve = _resolve!;
    this.#reject = _reject!;
    this.#state = "pending";
  }

  get state() {
    return this.#state;
  }

  async resolve(value: T | PromiseLike<T>) {
    await value;
    this.#state = "fulfilled";
    this.#resolve(value);
    return value;
  }

  reject(reason?: any) {
    this.#state = "rejected";
    this.#reject(reason);
  }
}

export type Result<T> =
  | { type: "ok"; value: T }
  | { type: "error" };

export async function* poolIterable<A, B>(
  limit: number,
  items: Iterable<A> | AsyncIterable<A>,
  map: (item: A) => Promise<B>,
) {
  const running: { key: number; d: Deferred<B | null> }[] = [];

  let key = 0;
  for await (const item of items) {
    key += 1;
    const d = new Deferred<B | null>();
    d.resolve(
      map(item).catch((e) => {
        console.error(e);
        return null;
      }),
    );

    console.log("adding", key);
    running.push({ key, d });
    console.log("running has", running.length, "items");

    if (running.length >= limit) {
      console.log("racing");
      // wait until some promise is done
      await Promise.race(running.map((x) => x.d));
      // yield all fulfilled promises
      const done = running.filter((x) => x.d.state === "fulfilled");
      for (const item of done) {
        console.log("yielding", item.key, running.indexOf(item));
        running.splice(running.findIndex((x) => x.key === item.key), 1);
        const value = await item.d;
        if (value !== null) {
          console.log("success", item.key);
          yield value;
        }
      }
    }
  }
  console.log("main for done");

  while (running.length > 0) {
    console.log("racing", running.length, running.map((x) => x.d));
    // wait until some promise is done
    await Promise.race(running.map((x) => x.d));
    console.log("done race");
    // yield all fulfilled promises
    const done = running.filter((x) => x.d.state === "fulfilled");
    console.log("done items", done.slice());
    for (const item of done) {
      console.log("yielding", item.key, running.indexOf(item));
      running.splice(running.findIndex((x) => x.key === item.key), 1);
      const value = await item.d;
      if (value !== null) {
        console.log("success", item.key);
        yield value;
      }
    }
  }
}
