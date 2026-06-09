// TODO(cleanup §21): This file appears to have no importers — the active
// HTTP wrapper lives at `client/libs/axiosConfig.ts` and is imported as
// `@/libs/axiosConfig` everywhere. Kept for now to avoid breaking any
// build-time path resolution; safe to delete once a follow-up confirms
// no out-of-tree references.
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
/** An Axios Request config object that fetches remote data from remote server.
 @returns {Promise<AxiosResponse<T>>} - Promise resolved with the newly expected type data.
 * @param actionType - Accepts any action method of an HTTP Request ('post','get','delete','patch')
 * @param url - The URL link of the caller
 * @param actionData - Any request body data that is to be sent with request.
 */
async function fetchAction<T>(
    actionType: AxiosRequestConfig['method'],
    url: string,
    actionData: object
): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
        method: actionType,
        url: url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: actionData
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        } else {
            console.log('An error occurred:', error);
            throw new Error('An error occurred while making the request.');
        }
    }
}

export default fetchAction;
