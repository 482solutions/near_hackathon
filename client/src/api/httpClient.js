import axios from "axios";

const StatusCode = {
  Unauthorized: 401,
  Forbidden: 403,
  TooManyRequests: 429,
  InternalServerError: 500,
  BadRequest: 400,
};

const headers = {
  "Content-Type": "application/json",
};

class HttpClient {
  instance = null;

  get http() {
    return this.instance != null ? this.instance : this.initHttp();
  }

  initHttp() {
    const http = axios.create({
      baseURL: process.env.REACT_APP_BASE_URL,
      headers,
      withCredentials: true,
    });

    http.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;
        return this.handleError(response);
      }
    );

    this.instance = http;
    return http;
  }

  request(config) {
    return this.http.request(config);
  }

  get(url, config) {
    return this.http.get(url, config);
  }

  post(url, data, config) {
    return this.http.post(url, data, config);
  }

  put(url, data, config) {
    return this.http.put(url, data, config);
  }

  patch(url, data, config) {
    return this.http.patch(url, data, config);
  }

  delete(url, config) {
    return this.http.delete(url, config);
  }

  async handleError(error) {
    if (!error) return;
    const { status } = error;

    switch (status) {
      case StatusCode.InternalServerError: {
        break;
      }
      case StatusCode.Forbidden: {
        break;
      }
      case StatusCode.Unauthorized: {
        break;
      }
      case StatusCode.TooManyRequests: {
        break;
      }
    }
    return Promise.reject(error);
  }
}

export const httpClient = new HttpClient();
