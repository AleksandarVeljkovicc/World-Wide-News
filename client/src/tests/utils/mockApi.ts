export const mockApiResponse = <T>(data: T, ok = true): Response => {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Bad Request',
    type: 'default' as ResponseType,
    url: '',
    clone: function () {
      return this
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => JSON.stringify(data),
  } as Response
}

export const createMockFetch = (responses: Map<string, Response>) => {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const key = `${options?.method || 'GET'}:${url}`
    const response = responses.get(key) || responses.get(url)
    
    if (!response) {
      throw new Error(`No mock response for ${key}`)
    }
    
    return response
  }
}
