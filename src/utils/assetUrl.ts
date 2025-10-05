export const resolveBaseUrl = () =>
  new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();

export const resolveAssetUrl = (path: string) => new URL(path, resolveBaseUrl()).toString();
