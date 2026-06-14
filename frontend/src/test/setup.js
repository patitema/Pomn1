const createStorageMock = () => {
  let store = {}

  return {
    clear: () => {
      store = {}
    },
    getItem: (key) => store[key] ?? null,
    key: (index) => Object.keys(store)[index] ?? null,
    removeItem: (key) => {
      delete store[key]
    },
    setItem: (key, value) => {
      store[key] = String(value)
    },
    get length() {
      return Object.keys(store).length
    },
  }
}

if (typeof globalThis.localStorage?.getItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorageMock(),
    configurable: true,
  })
}
