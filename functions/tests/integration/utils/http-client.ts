/**
 * Cliente HTTP para realizar peticiones a las Cloud Functions en el emulador
 */

interface HttpResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * Realiza una petición HTTP
 */
export async function request(options: RequestOptions): Promise<HttpResponse> {
  const {method, url, headers = {}, body} = options;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && (method === "POST" || method === "PUT" || method === "DELETE")) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: response.status,
    data,
    headers: responseHeaders,
  };
}

/**
 * Cliente HTTP para las funciones en el emulador
 */
export class FunctionsHttpClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = "http://localhost:5001/demo-test-project/us-central1") {
    this.baseUrl = baseUrl;
  }

  /**
   * Establece el token de autenticación
   */
  setAuthToken(token: string) {
    this.token = token;
  }

  /**
   * Limpia el token de autenticación
   */
  clearAuthToken() {
    this.token = undefined;
  }

  /**
   * Realiza una petición GET
   */
  async get(endpoint: string): Promise<HttpResponse> {
    return this.makeRequest("GET", endpoint);
  }

  /**
   * Realiza una petición POST
   */
  async post(endpoint: string, body?: unknown): Promise<HttpResponse> {
    return this.makeRequest("POST", endpoint, body);
  }

  /**
   * Realiza una petición PUT
   */
  async put(endpoint: string, body?: unknown): Promise<HttpResponse> {
    return this.makeRequest("PUT", endpoint, body);
  }

  /**
   * Realiza una petición DELETE
   */
  async delete(endpoint: string, body?: unknown): Promise<HttpResponse> {
    return this.makeRequest("DELETE", endpoint, body);
  }

  /**
   * Método privado para realizar peticiones
   */
  private async makeRequest(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: unknown
  ): Promise<HttpResponse> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return request({
      method,
      url,
      headers,
      body,
    });
  }
}
