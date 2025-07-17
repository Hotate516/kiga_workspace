export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null;
  let currentResolve: ((value: any) => void) | null = null; // Promise の resolve 関数を保持

  const debounced = (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      currentResolve = resolve; // 新しい Promise の resolve 関数を保存

      timeout = setTimeout(async () => {
        const result = await func(...args);
        if (currentResolve === resolve) { // 最新の呼び出しであれば解決
          resolve(result);
        }
      }, waitFor);
    });

  (debounced as any).cancel = () => { // cancel メソッドを追加
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      currentResolve = null; // resolve 関数もクリア
    }
  };

  return debounced;
}
