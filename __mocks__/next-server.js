// Mock for next/server
class MockNextRequest {
  constructor(input, init = {}) {
    this.input = input;
    this.init = init;
    this.headers = new Map(Object.entries(init.headers || {}));
    this.method = init.method || 'GET';
    this.url = input;
  }

  json() {
    return Promise.resolve(this.init.body ? JSON.parse(this.init.body) : {});
  }
}

class MockNextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  static json(data, init = {}) {
    return new MockNextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

module.exports = {
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
};
