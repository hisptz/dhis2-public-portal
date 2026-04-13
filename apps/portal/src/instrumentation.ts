export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { dhis2HttpClient } = await import("./utils/api/dhis2");
        try {
            await dhis2HttpClient.init()
            console.log("DHIS2 HTTP client initialized successfully")
        } catch (error) {
            console.error("Failed to initialize DHIS2 HTTP client:", error)
        }
    }
}