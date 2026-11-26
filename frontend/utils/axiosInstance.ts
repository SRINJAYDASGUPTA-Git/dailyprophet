import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

const isExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

// Request Interceptor – attach fresh token
axiosInstance.interceptors.request.use(async (config) => {
    if (typeof window === "undefined") return config;

    const publicPaths = ["/auth/login", "/auth/register"];
    const isPublic = publicPaths.some((path) => config.url?.includes(path));

    if (isPublic) return config;

    let accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (isExpired(accessToken) && refreshToken && !isExpired(refreshToken)) {
        try {
            const res = await axios.post("/api/auth/refresh", {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                },
                {
                    headers: {
                        "Authorization": `Bearer ${refreshToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = res.data;

            localStorage.setItem("access_token", data.data.access_token);
            localStorage.setItem("refresh_token", data.data.refresh_token);
            accessToken = data.data.access_token;
        } catch (err) {
            console.error("Token refresh failed:", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
    }

    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export default axiosInstance;