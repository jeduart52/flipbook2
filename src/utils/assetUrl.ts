export const resolveAssetUrl = (path: string) => new URL(path, import.meta.env.BASE_URL).toString();
