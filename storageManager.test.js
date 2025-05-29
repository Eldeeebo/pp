// storageManager.test.js
import { fetchSavedPrompts, updatePromptsInStorage } from './storageManager';

// Mock the chrome API
let mockStorage = {};
let mockLastError = null;

global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        if (mockLastError) {
          callback(undefined); // Pass undefined or an empty object if lastError is set
          return;
        }
        const key = Array.isArray(keys) ? keys[0] : keys; // Handle if keys is string or array
        const result = {};
        if (mockStorage.hasOwnProperty(key)) {
          result[key] = mockStorage[key];
        }
        callback(result);
      }),
      set: jest.fn((items, callback) => {
        if (mockLastError) {
          callback(); // Callback is still called, but lastError will be checked by the SUT
          return;
        }
        Object.assign(mockStorage, items);
        callback();
      }),
    },
  },
  runtime: {
    // Use a getter for lastError to allow it to be dynamically changed by tests
    get lastError() {
      return mockLastError;
    }
  },
};

describe('storageManager', () => {
  beforeEach(() => {
    // Reset mocks and storage before each test
    mockStorage = {};
    mockLastError = null;
    chrome.storage.sync.get.mockClear();
    chrome.storage.sync.set.mockClear();
  });

  describe('fetchSavedPrompts', () => {
    it('should resolve with an empty array if storage is empty', async () => {
      const prompts = await fetchSavedPrompts();
      expect(prompts).toEqual([]);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['prompter.abz4375'], expect.any(Function));
    });

    it('should resolve with parsed prompts if storage contains valid JSON', async () => {
      const testPrompts = [{ pTitle: 'Test 1', pContent: 'Content 1' }];
      mockStorage['prompter.abz4375'] = JSON.stringify(testPrompts);
      const prompts = await fetchSavedPrompts();
      expect(prompts).toEqual(testPrompts);
    });

    it('should reject if chrome.runtime.lastError is set during fetch', async () => {
      mockLastError = { message: 'Error fetching data' };
      await expect(fetchSavedPrompts()).rejects.toEqual(mockLastError);
    });

    it('should reject if stored data is invalid JSON', async () => {
      mockStorage['prompter.abz4375'] = 'invalid_json_data';
      // Expecting a specific error message or type can be more robust
      await expect(fetchSavedPrompts()).rejects.toThrow("Failed to parse stored prompts. Data may be corrupted.");
    });
  });

  describe('updatePromptsInStorage', () => {
    it('should call chrome.storage.sync.set with correctly stringified data', async () => {
      const testPrompts = [{ pTitle: 'Test Update', pContent: 'Content Update' }];
      await updatePromptsInStorage(testPrompts);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { 'prompter.abz4375': JSON.stringify(testPrompts) },
        expect.any(Function)
      );
    });

    it('should reject if chrome.runtime.lastError is set during update', async () => {
      mockLastError = { message: 'Error updating data' };
      const testPrompts = [{ pTitle: 'Test Error', pContent: 'Content Error' }];
      await expect(updatePromptsInStorage(testPrompts)).rejects.toEqual(mockLastError);
    });

    it('should reject if promptsArray is not serializable (e.g., contains circular references)', async () => {
      const circularPrompts = [];
      const prompt = { pTitle: 'Circular', pContent: 'Ref', self: null };
      prompt.self = prompt; // Create circular reference
      circularPrompts.push(prompt);
      
      // We expect updatePromptsInStorage to reject because JSON.stringify will throw
      await expect(updatePromptsInStorage(circularPrompts)).rejects.toThrow(TypeError);
    });
  });
});
