// aiFeatures.test.js
import { getAISuggestedTitle } from './aiFeatures';

describe('aiFeatures', () => {
  describe('getAISuggestedTitle', () => {
    beforeEach(() => {
      jest.useFakeTimers(); // Use fake timers to control setTimeout
    });

    afterEach(() => {
      jest.clearAllTimers(); // Clear all timers after each test
      jest.useRealTimers(); // Restore real timers
    });

    it('should return a Promise', () => {
      const result = getAISuggestedTitle("Some content");
      expect(result).toBeInstanceOf(Promise);
      // Need to run timers for the promise to resolve, even if just checking type
      jest.runAllTimers(); 
      return result.catch(() => {}); // Handle potential rejection if content was empty for some reason
    });

    it('should resolve with "AI: Untitled Prompt" for empty content after a delay', async () => {
      const promise = getAISuggestedTitle("");
      jest.runAllTimers(); // Advance timers to trigger setTimeout
      const title = await promise;
      expect(title).toBe("AI: Untitled Prompt");
    });

    it('should resolve with "AI: Untitled Prompt" for whitespace-only content', async () => {
      const promise = getAISuggestedTitle("   ");
      jest.runAllTimers();
      const title = await promise;
      expect(title).toBe("AI: Untitled Prompt");
    });

    it('should suggest a title based on the first 5 words, capitalized, with "AI: " prefix', async () => {
      const content = "this is a test prompt with more than five words";
      const promise = getAISuggestedTitle(content);
      jest.runAllTimers();
      const title = await promise;
      expect(title).toBe("AI: This Is A Test Prompt...");
    });

    it('should handle content with fewer than 5 words correctly (no ellipsis)', async () => {
      const content = "short and sweet";
      const promise = getAISuggestedTitle(content);
      jest.runAllTimers();
      const title = await promise;
      expect(title).toBe("AI: Short And Sweet");
    });

    it('should handle content with exactly 5 words correctly (no ellipsis)', async () => {
      const content = "one two three four five";
      const promise = getAISuggestedTitle(content);
      jest.runAllTimers();
      const title = await promise;
      expect(title).toBe("AI: One Two Three Four Five");
    });
    
    it('should correctly capitalize mixed-case words and add ellipsis if needed', async () => {
      const content = "fIrSt wOrD sEcOnD anD sO oN forTH";
      const promise = getAISuggestedTitle(content);
      jest.runAllTimers();
      const title = await promise;
      expect(title).toBe("AI: First Word Second And So...");
    });

    it('should handle potential empty strings from multiple spaces correctly', async () => {
      const content = "word1  word2   word3    word4     word5      word6";
      const promise = getAISuggestedTitle(content);
      jest.runAllTimers();
      const title = await promise;
      expect(title).toBe("AI: Word1 Word2 Word3 Word4 Word5...");
    });
  });
});
