import { Cache } from './cache';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

function isCacheableMethod(config: AxiosRequestConfig) {
    return ~['GET', 'HEAD'].indexOf((config.method as string).toUpperCase());
}

function getUUIDByAxiosConfig(config: AxiosRequestConfig): string {
    return config.url as string;
}

// commented because of https://flowfact.atlassian.net/browse/FLOW-9170
// function getHeaderCaseInsensitive(headerName: string, headers = {}) {
//     const headerKeys = Object.keys(headers);
//     const key = headerKeys.find((value) => value.toLowerCase() === headerName);
//     if (!key) {
//         return undefined;
//     }
//
//     return headers[key];
// }

function getCacheByAxiosConfig(config: AxiosRequestConfig) {
    return Cache.get(getUUIDByAxiosConfig(config));
}

function requestInterceptor(config: AxiosRequestConfig) {
    if (isCacheableMethod(config)) {
        const uuid = getUUIDByAxiosConfig(config);
        const lastCachedResult = Cache.get(uuid);
        if (lastCachedResult) {
            config.headers = { ...config.headers, 'If-None-Match': lastCachedResult.etag };
        }
    }
    return config;
}

function responseInterceptor(response: AxiosResponse) {
    // commented because of https://flowfact.atlassian.net/browse/FLOW-9170
    // if (isCacheableMethod(response.config)) {
    //     const responseETAG = getHeaderCaseInsensitive('etag', response.headers);
    //     if (responseETAG) {
    //         Cache.set(getUUIDByAxiosConfig(response.config), responseETAG, response.data);
    //     }
    // }
    return response;
}

function responseErrorInterceptor(error: AxiosError) {
    if (error.response && error.response.status === 304) {
        const getCachedResult = getCacheByAxiosConfig(error.response.config);
        if (!getCachedResult) {
            return Promise.reject(error);
        }
        const newResponse = error.response;
        newResponse.status = 200;
        newResponse.data = getCachedResult.value;
        return Promise.resolve(newResponse);
    }
    return Promise.reject(error);
}

export function resetCache() {
    Cache.reset();
}

export default function axiosETAGCache(config?: AxiosRequestConfig) {
    const instance = axios.create(config);
    instance.interceptors.request.use(requestInterceptor);
    instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

    return instance;
}
