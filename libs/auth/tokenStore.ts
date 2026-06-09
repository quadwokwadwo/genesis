// Dedicated in-memory access token store.
// The actual storage lives in `@/libs/axiosConfig` so the axios interceptor and
// every consumer share a single module-scoped variable. This file re-exports
// the helpers under the path requested by Module 01 of the architecture spec.
export { getAccessToken, setAccessToken } from '@/libs/axiosConfig';
import { setAccessToken as _set } from '@/libs/axiosConfig';

export const clearAccessToken = () => _set(null);
