// promptManager.test.js
import { addNewPromptToList, deletePromptFromList } from './promptManager';
import * as storageManager from './storageManager'; // To mock its functions
import * as uiEventHandlers from './uiEventHandlers'; // To mock showFeedback

// Mock storageManager module
jest.mock('./storageManager', () => ({
  updatePromptsInStorage: jest.fn(),
  // We don't need fetchSavedPrompts for these specific tests in promptManager
}));

// Mock uiEventHandlers module (specifically showFeedback)
jest.mock('./uiEventHandlers', () => ({
  ...jest.requireActual('./uiEventHandlers'), // Import and retain other exports
  showFeedback: jest.fn(),
}));

describe('promptManager', () => {
  let savedPromptsArray_ref;

  beforeEach(() => {
    // Reset the mock array and mock function calls before each test
    savedPromptsArray_ref = [];
    storageManager.updatePromptsInStorage.mockClear();
    uiEventHandlers.showFeedback.mockClear(); // Clear mock calls for showFeedback
  });

  describe('addNewPromptToList', () => {
    it('should add a new prompt to the list and call updatePromptsInStorage', async () => {
      const newPrompt = { pTitle: 'New', pContent: 'Prompt' };
      storageManager.updatePromptsInStorage.mockResolvedValue(undefined); // Simulate successful storage update

      const success = await addNewPromptToList(newPrompt, savedPromptsArray_ref);

      expect(success).toBe(true);
      expect(savedPromptsArray_ref).toHaveLength(1);
      expect(savedPromptsArray_ref[0]).toEqual(newPrompt);
      expect(storageManager.updatePromptsInStorage).toHaveBeenCalledWith(savedPromptsArray_ref);
    });

    it('should return false if updatePromptsInStorage fails', async () => {
      const newPrompt = { pTitle: 'Fail', pContent: 'To Save' };
      const originalConsoleError = console.error; // Suppress console.error for this test
      console.error = jest.fn();
      storageManager.updatePromptsInStorage.mockRejectedValue(new Error('Storage failed'));

      const success = await addNewPromptToList(newPrompt, savedPromptsArray_ref);

      expect(success).toBe(false);
      // The array reference is modified optimistically before storage call,
      // but the function returns false, indicating failure to persist.
      // Depending on requirements, one might want to revert the array change here.
      // For this test, we verify the return value and that storage was called.
      expect(savedPromptsArray_ref).toHaveLength(1); // Array was modified
      expect(storageManager.updatePromptsInStorage).toHaveBeenCalled();
      console.error = originalConsoleError; // Restore console.error
    });
  });

  describe('deletePromptFromList', () => {
    beforeEach(() => {
      // Populate the array for deletion tests
      savedPromptsArray_ref.push(
        { pTitle: 'Prompt 1', pContent: 'Content 1' },
        { pTitle: 'Prompt 2', pContent: 'Content 2' },
        { pTitle: 'Prompt 3', pContent: 'Content 3' }
      );
    });

    it('should delete a prompt from the list and call updatePromptsInStorage', async () => {
      const indexToDelete = 1;
      const expectedRemainingPrompts = [
        { pTitle: 'Prompt 1', pContent: 'Content 1' },
        { pTitle: 'Prompt 3', pContent: 'Content 3' },
      ];
      storageManager.updatePromptsInStorage.mockResolvedValue(undefined);

      const success = await deletePromptFromList(indexToDelete, savedPromptsArray_ref);

      expect(success).toBe(true);
      expect(savedPromptsArray_ref).toHaveLength(2);
      expect(savedPromptsArray_ref).toEqual(expectedRemainingPrompts);
      expect(storageManager.updatePromptsInStorage).toHaveBeenCalledWith(expectedRemainingPrompts);
    });

    it('should return false if updatePromptsInStorage fails during delete', async () => {
      const indexToDelete = 0;
      const originalConsoleError = console.error;
      console.error = jest.fn();
      storageManager.updatePromptsInStorage.mockRejectedValue(new Error('Storage failed'));

      const success = await deletePromptFromList(indexToDelete, savedPromptsArray_ref);

      expect(success).toBe(false);
      // Array is modified before storage call. Function returns false on storage failure.
      expect(savedPromptsArray_ref).toHaveLength(2); 
      expect(storageManager.updatePromptsInStorage).toHaveBeenCalled();
      console.error = originalConsoleError;
    });

    it('should return false for an invalid negative index and not call storage', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn(); // Suppress expected error log for invalid index
      const success = await deletePromptFromList(-1, savedPromptsArray_ref);
      expect(success).toBe(false);
      expect(savedPromptsArray_ref).toHaveLength(3); // Array remains unchanged
      expect(storageManager.updatePromptsInStorage).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("[promptManager] Invalid index for deletion:", -1);
      console.error = originalConsoleError;
    });

    it('should return false for an out-of-bounds index and not call storage', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();
      const success = await deletePromptFromList(3, savedPromptsArray_ref); // Index 3 is out of bounds for length 3
      expect(success).toBe(false);
      expect(savedPromptsArray_ref).toHaveLength(3);
      expect(storageManager.updatePromptsInStorage).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("[promptManager] Invalid index for deletion:", 3);
      console.error = originalConsoleError;
    });
  });
});
