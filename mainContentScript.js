import { fetchSavedPrompts } from './storageManager.js'; // Removed unused updatePromptsInStorage
import { createPrompterPanelShell } from './domManipulator.js'; // Removed unused createButton, createPromptWindowElements
import { handleAddPrompt } from './uiEventHandlers.js';
import { pushPrompt } from './promptManager.js';

(() => {
  let savedPrompts = [];
  let prompterPanelExists = false; 
  let currentPrompterPanel = null; 
  let observer = null; 

  const Prompter = async () => {
    console.log("[mainContentScript] Prompter function started.");

    try {
      savedPrompts = await fetchSavedPrompts();
      console.log("[mainContentScript] Fetched prompts, count:", savedPrompts.length);
    } catch (error) {
      console.error("[mainContentScript] Critical error fetching saved prompts in Prompter:", error);
      // Display a more user-friendly error in the UI if possible, or at least inform the user.
      // For now, defaulting to an empty array is a form of graceful degradation.
      savedPrompts = [];
      // alert("Error: Could not load your saved prompts. Some features might not work correctly.");
    }

    try {
      const existingPanel = document.querySelector(".prompter-panel-base");
      if (existingPanel) {
        console.log("[mainContentScript] Removing existing prompter panel.");
        existingPanel.remove();
      }
      prompterPanelExists = false; // Reset regardless of whether it was found and removed or just not there
      currentPrompterPanel = null; // Clear reference
    } catch (e) {
        console.error("[mainContentScript] Error removing existing panel:", e);
    }


    const panelElements = createPrompterPanelShell();
    if (!panelElements || !panelElements.prompterPanel) {
        console.error("[mainContentScript] Failed to create prompter panel shell. Aborting Prompter.");
        return;
    }
    const { prompterPanel, addPromptBtn, promptStack } = panelElements;
    currentPrompterPanel = prompterPanel;

    try {
      savedPrompts.forEach((sPrompt, index) => {
        pushPrompt(sPrompt, promptStack, index, savedPrompts);
      });
    } catch(e) {
        console.error("[mainContentScript] Error while populating prompts with pushPrompt:", e);
        // This might leave the UI in an inconsistent state for some prompts
    }
    

    if (addPromptBtn) { // Check if addPromptBtn was successfully created
        addPromptBtn.onclick = () => {
            try {
                handleAddPrompt(promptStack, savedPrompts, pushPrompt);
            } catch (e) {
                console.error("[mainContentScript] Error in addPromptBtn.onclick (calling handleAddPrompt):", e);
            }
        };
    } else {
        console.warn("[mainContentScript] addPromptBtn not found after creating panel shell.");
    }


    const attachPrompterPanel = () => {
      try {
        const sideMenuContent = document.querySelector(".side-menu-content.pt-4.p-10.svelte-dfnwyi");
        if (sideMenuContent && !prompterPanelExists && currentPrompterPanel) {
          sideMenuContent.appendChild(currentPrompterPanel);
          setTimeout(() => {
            if (currentPrompterPanel) currentPrompterPanel.classList.add('visible');
          }, 125);
          prompterPanelExists = true;
          if (observer) {
              observer.disconnect(); 
              console.log("[mainContentScript] MutationObserver disconnected after panel attachment.");
          }
        } else if (!sideMenuContent) {
            console.warn("[mainContentScript] Side menu content not found for attaching panel.");
        }
      } catch (e) {
        console.error("[mainContentScript] Error in attachPrompterPanel:", e);
      }
    };
    
    if (observer) {
        observer.disconnect(); // Disconnect any previous observer
        console.log("[mainContentScript] Previous MutationObserver disconnected.");
    }

    observer = new MutationObserver((mutations) => {
      try {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "class") {
            const sideMenu = document.querySelector(".side-menu.default.svelte-dfnwyi");
            if (sideMenu && sideMenu.classList.contains("active")) {
              if (!document.querySelector(".prompter-panel-base")) {
                  console.log("[mainContentScript] Side menu active, prompter panel not found. Re-initializing Prompter.");
                  Prompter(); 
              } else if (currentPrompterPanel && !prompterPanelExists) {
                   console.log("[mainContentScript] Side menu active, attaching existing panel.");
                   attachPrompterPanel();
              }
            } else {
              if (currentPrompterPanel) currentPrompterPanel.classList.remove('visible');
              setTimeout(() => {
                if (currentPrompterPanel && currentPrompterPanel.parentNode) {
                  currentPrompterPanel.parentNode.removeChild(currentPrompterPanel);
                  console.log("[mainContentScript] Prompter panel removed due to side menu inactive/closed.");
                }
                prompterPanelExists = false;
                currentPrompterPanel = null; 
              }, 250);
            }
          }
        });
      } catch (e) {
        console.error("[mainContentScript] Error in MutationObserver callback:", e);
      }
    });

    try {
      const sideMenuToObserve = document.querySelector(".side-menu.default.svelte-dfnwyi");
      if (sideMenuToObserve) {
        observer.observe(sideMenuToObserve, { attributes: true });
        console.log("[mainContentScript] MutationObserver is now observing the side menu.");
        if (sideMenuToObserve.classList.contains("active")) {
          attachPrompterPanel();
        }
      } else {
        console.warn("[mainContentScript] Side menu element to observe not found.");
      }
    } catch (e) {
        console.error("[mainContentScript] Error setting up MutationObserver:", e);
    }
    

    window.addEventListener("beforeunload", () => {
      try {
        console.log("[mainContentScript] beforeunload event triggered. Cleaning up prompter panel and observer.");
        if (currentPrompterPanel && currentPrompterPanel.parentNode) {
          currentPrompterPanel.parentNode.removeChild(currentPrompterPanel);
        }
        prompterPanelExists = false;
        currentPrompterPanel = null;
        if (observer) {
          observer.disconnect();
          console.log("[mainContentScript] MutationObserver disconnected on beforeunload.");
        }
      } catch (e) {
        console.error("[mainContentScript] Error in beforeunload listener:", e);
      }
    });
    console.log("[mainContentScript] Prompter function finished initialization.");
  };

  const initializePrompter = (ON) => {
    try {
      if (ON) {
        console.log("[mainContentScript] Initializing Prompter (State: ON)");
        Prompter(); 
      } else {
        console.log("[mainContentScript] De-initializing Prompter (State: OFF)");
        const prompterPanelElem = document.querySelector(".prompter-panel-base");
        if (prompterPanelElem) {
          prompterPanelElem.remove();
        }
        prompterPanelExists = false;
        currentPrompterPanel = null;
        if (observer) { 
          observer.disconnect();
          observer = null; 
          console.log("[mainContentScript] MutationObserver disconnected during de-initialization.");
        }
      }
    } catch (e) {
        console.error("[mainContentScript] Error in initializePrompter:", e);
    }
  };

  try {
    initializePrompter(true);
  } catch (e) {
    console.error("[mainContentScript] Error during initial call to initializePrompter:", e);
  }
  

  chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    try {
      const { message } = obj;
      let statusResponse = "Unknown message";

      if (message === "turnOn") {
        console.log("[mainContentScript] Received 'turnOn' message.");
        initializePrompter(true);
        statusResponse = "Prompter turned on";
      } else if (message === "turnOff") {
        console.log("[mainContentScript] Received 'turnOff' message.");
        initializePrompter(false);
        statusResponse = "Prompter turned off";
      } else {
        console.warn("[mainContentScript] Received unknown message:", obj);
      }
      sendResponse({ status: statusResponse });
    } catch (e) {
      console.error("[mainContentScript] Error in chrome.runtime.onMessage listener:", e);
      // Attempt to send a response even if there's an error, if appropriate
      // sendResponse({ status: "Error processing message", error: e.message });
      // However, be careful as sendResponse can only be called once.
      // If sendResponse was already called before the error, this might fail.
      // Returning true is important for async sendResponse, but if an error occurs before that,
      // it might not be possible to respond.
    }
    return true; // Keep message channel open for asynchronous response
  });
})();
