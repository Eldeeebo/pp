// storageManager.js

export const fetchSavedPrompts = () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["prompter.abz4375"], (result) => {
        if (chrome.runtime.lastError) {
          console.error("[storageManager] Error fetching prompts from storage:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          const key = "prompter.abz4375";
          if (result[key]) {
            try {
              const parsedPrompts = JSON.parse(result[key]);
              resolve(parsedPrompts);
            } catch (parseError) {
              console.error("[storageManager] Error parsing prompts from storage:", parseError);
              // Resolve with empty array or reject, depending on desired recovery behavior.
              // Rejecting might be better to signal that stored data was corrupt.
              reject(new Error("Failed to parse stored prompts. Data may be corrupted."));
            }
          } else {
            resolve([]); // No prompts found, resolve with empty array
          }
        }
      });
    } catch (e) {
      // This catch block is for synchronous errors in the setup of chrome.storage.sync.get,
      // though typically errors here would be caught by the callback's lastError.
      console.error("[storageManager] Synchronous error setting up fetch operation:", e);
      reject(e);
    }
  });
};

export const updatePromptsInStorage = (promptsArray) => {
  return new Promise((resolve, reject) => {
    try {
      const dataToStore = JSON.stringify(promptsArray);
      chrome.storage.sync.set({ ["prompter.abz4375"]: dataToStore }, () => {
        if (chrome.runtime.lastError) {
          console.error("[storageManager] Error updating prompts in storage:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } catch (e) {
      // Catches errors from JSON.stringify if promptsArray is not serializable
      console.error("[storageManager] Error serializing prompts for storage:", e);
      reject(e);
    }
  });
};
