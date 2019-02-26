import axios from 'axios';
import credentials from './credentials';

const endpoint = 'https://api.tfl.gov.uk/';

class TflClient {

    constructor (appId, appKey) {
        this.appId = appId;
        this.appKey = appKey;
    }

    get(resource, params) {
        params.appId = this.appId;
        params.appKey = this.appKey;
        return axios.get(endpoint + resource, {
            params
        });
    }

    /**
     *
     * @param resource {String} API endpoint
     * @param params {Object} Query parameters
     * @returns {AxiosPromise<any>}
     */
    getNoCredentials(resource, params) {
        return axios.get(endpoint + resource, {params});
    }
}

let client = new TflClient(credentials.appId, credentials.appKey);
export { client };