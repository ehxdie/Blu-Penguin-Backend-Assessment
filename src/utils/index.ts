export function isDevEnvironment(): boolean {
    const nodeEnv = process.env.NODE_ENV;
    return nodeEnv === "development";
}