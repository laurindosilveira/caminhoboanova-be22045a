export function ignoreAsyncError(
  operation: PromiseLike<unknown>,
  context: string,
) {
  void Promise.resolve(operation).catch((error) => {
    console.error(`[${context}]`, error);
  });
}
