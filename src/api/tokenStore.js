// Module-level variable — token lives only in JS memory, never in any browser storage
let _token = null;

export const getToken = () => _token;
export const setToken = (t) => { _token = t; };
export const clearToken = () => { _token = null; };
