import axios from 'axios';
import credentials from './credentials';

const endpoint = 'https://api.tfl.gov.uk/';

class TflClient {
  constructor(appId, appKey) {
    this.appId = appId;
    this.appKey = appKey;
  }

  get(resource, params) {
    const query = {
      appId: this.appId,
      appKey: this.appKey,
      ...params,
    };
    return axios.get(endpoint + resource, {
      params: query,
    });
  }

  /**
   *
   * @param resource {String} API endpoint
   * @param params {Object} Query parameters
   * @returns {AxiosPromise<any>}
   */
  static getNoCredentials(resource, params) {
    return axios.get(endpoint + resource, { params });
  }
}

export { TflClient };
const client = new TflClient(credentials.appId, credentials.appKey);
export default client;
