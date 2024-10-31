// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || 'condition is not truthy');
  }
}

export function assertDefined<T>(value: T | undefined, msg?: string): asserts value is T {
  if (value === undefined) {
    throw new Error(msg ?? 'value is undefined');
  }
}

export function assertDefinedAndNotNull<T>(
  value: T | undefined | null,
  msg?: string
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(msg ?? 'value is undefined or null');
  }
}

export function blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64: string) {}
