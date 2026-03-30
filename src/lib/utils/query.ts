export function parseQueryParams<T extends Record<string, unknown>>(searchParams: URLSearchParams): Partial<T> {
    const params: Partial<T> = {};
    searchParams.forEach((value, key) => {
        if (value === 'true') params[key as keyof T] = true as T[keyof T];
        else if (value === 'false') params[key as keyof T] = false as T[keyof T];
        else if (!isNaN(Number(value))) params[key as keyof T] = Number(value) as T[keyof T];
        else params[key as keyof T] = value as T[keyof T];
    });
    return params;
}
