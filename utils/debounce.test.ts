import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // タイマーをモックする
  });

  afterEach(() => {
    vi.useRealTimers(); // タイマーを元に戻す
  });

  it('should debounce a function call', async () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    // 1000ms 未満では関数は呼ばれない
    vi.advanceTimersByTime(500);
    expect(func).not.toHaveBeenCalled();

    // 1000ms 経過後に一度だけ関数が呼ばれる
    vi.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(1);

    // さらに呼び出しても、再度デバウンスされる
    debouncedFunc();
    vi.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(1); // まだ呼ばれていない

    vi.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(2); // 2回目が呼ばれた
  });

  it('should pass arguments to the debounced function', async () => {
    const func = vi.fn((arg1: string, arg2: number) => `${arg1}-${arg2}`);
    const debouncedFunc = debounce(func, 500);

    debouncedFunc('hello', 1);
    debouncedFunc('world', 2);

    vi.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('world', 2); // 最後の引数が渡される
  });

  it('should debounce an async function call', async () => {
    const asyncFunc = vi.fn(async (value: string) => {
      console.log(`asyncFunc called with: ${value} at ${Date.now()}`);
      await new Promise(resolve => setTimeout(() => {
        console.log(`asyncFunc internal setTimeout resolved for: ${value} at ${Date.now()}`);
        resolve(null);
      }, 10)); // 非同期処理をシミュレート
      console.log(`asyncFunc finished for: ${value} at ${Date.now()}`);
      return `Processed: ${value}`;
    });
    const debouncedAsyncFunc = debounce(asyncFunc, 1000);

    console.log(`Debounced function called first at ${Date.now()}`);
    const promise1 = debouncedAsyncFunc('first');
    console.log(`Debounced function called second at ${Date.now()}`);
    const promise2 = debouncedAsyncFunc('second');

    console.log(`Advancing timers by 500ms at ${Date.now()}`);
    vi.advanceTimersByTime(500); // ここは await なし
    console.log(`Timers advanced by 500ms, asyncFunc calls: ${asyncFunc.mock.calls.length} at ${Date.now()}`);
    expect(asyncFunc).not.toHaveBeenCalled();

    console.log(`Advancing timers by 500ms (total 1000ms) at ${Date.now()}`);
    await vi.advanceTimersByTimeAsync(500 + 10); // 10ms を追加
    console.log(`Timers advanced by 500ms, asyncFunc calls: ${asyncFunc.mock.calls.length} at ${Date.now()}`);
    
    expect(asyncFunc).toHaveBeenCalledTimes(1);
    expect(asyncFunc).toHaveBeenCalledWith('second');

    console.log(`Waiting for promise2 to resolve at ${Date.now()}`);
    const result = await promise2; // promise1 は破棄されるため、promise2 の結果を待つ
    console.log(`Promise2 resolved with: ${result} at ${Date.now()}`);
    expect(result).toBe("Processed: second");
  });

  it('should not call the function if cleared', async () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();
    vi.advanceTimersByTime(50);
    // @ts-ignore
    debouncedFunc.cancel(); // debounce 関数に cancel メソッドがないため、一時的に無視

    vi.advanceTimersByTime(1000);
    expect(func).not.toHaveBeenCalled();
  });
});
