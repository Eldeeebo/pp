// UI Event Handlers
import { createFeedbackMessageElement } from './domManipulator.js';

// Handler for the main "Add Prompt" button (the plus button)
export const handleAddPrompt = (promptStack, savedPromptsArray, pushPromptFn) => {
  try {
    const newIndex = savedPromptsArray.length;
    // It's assumed pushPromptFn itself will handle its internal errors,
    // and critical errors might be thrown or logged there.
    pushPromptFn({ pTitle: "", pContent: "" }, promptStack, newIndex, savedPromptsArray, true);
  } catch (error) {
    console.error("[uiEventHandlers] Error in handleAddPrompt:", error);
    // Potentially show a generic error to the user if the app is in a very broken state.
    // alert("An unexpected error occurred while trying to add a new prompt.");
  }
};

// Handler for individual prompt's "Save" button (for NEW prompts)
export const handleSavePrompt = async (
  promptElements, 
  promptData, 
  savedPromptsArray, 
  index, 
  promptStack,
  isNew, 
  addPromptToListFn // This is expected to be addNewPromptToList from promptManager
) => {
  const { promptWindow, promptTitleInput, textarea, buttonContainer, saveBtn } = promptElements;

  try {
    if (promptTitleInput.value.trim() === "" || textarea.innerText.trim() === "") {
      alert("Title and content cannot be empty."); // Simple validation, not a critical error
      return false; 
    }
    
    promptTitleInput.readOnly = true;
    textarea.contentEditable = false;
    promptTitleInput.classList.remove('editable-field');
    textarea.classList.remove('editable-field');

    const newPromptDetails = {
      pTitle: promptTitleInput.value,
      pContent: textarea.innerText,
    };

    // addPromptToListFn is async and returns true/false
    const success = await addPromptToListFn(newPromptDetails, savedPromptsArray);

    if (success) {
      if (buttonContainer.contains(saveBtn)) {
        buttonContainer.removeChild(saveBtn);
      }
      showFeedback(promptWindow, "Prompt Saved!");
      return true; 
    } else {
      // Error was already logged by addPromptToListFn, show UI feedback
      promptTitleInput.readOnly = false; 
      textarea.contentEditable = true;
      promptTitleInput.classList.add('editable-field');
      textarea.classList.add('editable-field');
      showFeedback(promptWindow, "Error saving!");
      return false; 
    }
  } catch (error) {
    console.error("[uiEventHandlers] Critical error in handleSavePrompt:", error);
    // Revert UI to editable state as a fallback
    promptTitleInput.readOnly = false; 
    textarea.contentEditable = true;
    promptTitleInput.classList.add('editable-field');
    textarea.classList.add('editable-field');
    showFeedback(promptWindow, "An unexpected error occurred while saving!");
    return false;
  }
};

// Handler for individual prompt's "Delete" button
export const handleDeletePrompt = async (
  index, 
  savedPromptsArray, 
  promptWindow, 
  promptStack,
  deletePromptFromListFn // This is expected to be deletePromptFromList from promptManager
) => {
  try {
    promptWindow.classList.remove('visible'); 
    promptWindow.style.opacity = '0.5'; 

    // deletePromptFromListFn is async and returns true/false
    const success = await deletePromptFromListFn(index, savedPromptsArray);
    
    if (success) {
      setTimeout(() => {
        if (promptWindow.parentNode === promptStack) { 
            promptStack.removeChild(promptWindow);
        }
      }, 250); 
    } else {
      // Error was already logged by deletePromptFromListFn, show UI feedback
      promptWindow.classList.add('visible');
      promptWindow.style.opacity = '1'; 
      showFeedback(promptWindow, "Error deleting!");
    }
  } catch (error) {
    console.error("[uiEventHandlers] Critical error in handleDeletePrompt:", error);
    // Revert UI changes if possible or show generic error
    promptWindow.classList.add('visible');
    promptWindow.style.opacity = '1';
    showFeedback(promptWindow, "An unexpected error occurred while deleting!");
  }
};

// Handler for individual prompt's "Copy" button
export const handleCopyPrompt = async (textarea) => {
  const textToCopy = textarea.innerText;
  try {
    await navigator.clipboard.writeText(textToCopy);
    // Visual feedback: change text, then revert
    const originalText = textarea.innerText; // This is actually textToCopy
    textarea.innerText = "Copied!";
    setTimeout(() => {
      textarea.innerText = textToCopy; // Revert to the actual copied text
    }, 1500);
  } catch (error) {
    console.error("[uiEventHandlers] Error copying text to clipboard:", error);
    showFeedback(textarea.closest('.prompt-window'), "Copy failed!"); 
  }
};

// Handler for the "Suggest Title" button
export const handleSuggestTitleClick = async (promptContentEl, titleInputEl, suggestTitleFn, suggestTitleBtnEl) => {
  const currentContent = promptContentEl.innerText;
  if (!currentContent.trim()) {
    return; 
  }

  const originalButtonText = suggestTitleBtnEl.textContent;
  suggestTitleBtnEl.disabled = true;
  suggestTitleBtnEl.textContent = "✨ Thinking...";

  try {
    const suggestedTitle = await suggestTitleFn(currentContent);
    titleInputEl.value = suggestedTitle;
  } catch (error) {
    console.error("[uiEventHandlers] Error suggesting title:", error);
    const promptWindow = promptContentEl.closest('.prompt-window');
    if (promptWindow) { // Ensure promptWindow is found before showing feedback
        showFeedback(promptWindow, "Suggestion failed!");
    }
  } finally {
    suggestTitleBtnEl.disabled = false;
    suggestTitleBtnEl.textContent = originalButtonText;
  }
};

// Helper function to show feedback message
export const showFeedback = (promptWindow, message) => {
  if (!promptWindow) {
    console.warn("[uiEventHandlers] Attempted to show feedback on a null promptWindow for message:", message);
    return;
  }
  try {
    const existingFeedback = promptWindow.querySelector('.prompt-feedback-message');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    const feedbackElement = createFeedbackMessageElement(message);
    promptWindow.appendChild(feedbackElement);
    
    feedbackElement.offsetHeight; 
    feedbackElement.classList.add('visible');

    setTimeout(() => {
      feedbackElement.classList.remove('visible');
      setTimeout(() => {
        if (feedbackElement.parentNode === promptWindow) {
          promptWindow.removeChild(feedbackElement);
        }
      }, 500); 
    }, 2000);
  } catch (error) {
    console.error("[uiEventHandlers] Error in showFeedback:", error);
  }
};
