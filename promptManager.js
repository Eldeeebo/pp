// Prompt Management Logic
import { createButton, createPromptWindowElements } from './domManipulator.js';
import { 
    handleCopyPrompt, 
    handleDeletePrompt as uiHandleDelete, 
    handleSavePrompt as uiHandleSave, 
    handleSuggestTitleClick as uiHandleSuggestTitle,
    showFeedback 
} from './uiEventHandlers.js';
import { updatePromptsInStorage } from './storageManager.js';
import { getAISuggestedTitle } from './aiFeatures.js';

export const addNewPromptToList = async (promptDetails, savedPromptsArray_ref) => {
  const newPrompts = [...savedPromptsArray_ref, promptDetails];
  try {
    await updatePromptsInStorage(newPrompts);
    savedPromptsArray_ref.length = 0;
    Array.prototype.push.apply(savedPromptsArray_ref, newPrompts);
    console.log("[promptManager] Successfully added new prompt and updated storage.");
    return true;
  } catch (error) {
    console.error("[promptManager] Error adding new prompt to storage:", error);
    return false;
  }
};

export const deletePromptFromList = async (index, savedPromptsArray_ref) => {
  const newPrompts = [...savedPromptsArray_ref];
  if (index < 0 || index >= newPrompts.length) {
    console.error("[promptManager] Invalid index for deletion:", index);
    return false;
  }
  newPrompts.splice(index, 1);
  
  try {
    await updatePromptsInStorage(newPrompts);
    savedPromptsArray_ref.length = 0;
    Array.prototype.push.apply(savedPromptsArray_ref, newPrompts);
    console.log("[promptManager] Successfully deleted prompt and updated storage.");
    return true;
  } catch (error) {
    console.error("[promptManager] Error deleting prompt from storage:", error);
    return false;
  }
};

export const pushPrompt = (prompt, promptStack, index, savedPromptsArray_ref, isNew = false) => {
  try {
    const { pTitle, pContent } = prompt;

    const elements = createPromptWindowElements(prompt);
    const { promptWindow, promptTitleInput, textarea, buttonContainer, suggestTitleBtn } = elements;

    const toggleSuggestButtonState = () => {
      try { // Added try-catch for DOM property access
        suggestTitleBtn.disabled = (textarea.innerText.trim() === "");
      } catch (e) {
        console.warn("[promptManager] Error toggling suggest button state:", e);
      }
    };

    toggleSuggestButtonState();
    textarea.addEventListener('input', toggleSuggestButtonState);
    
    // MutationObserver for contenteditable changes (simplified)
    // No direct error expected here unless observer setup is wrong, which is less likely.
    const contentObserver = new MutationObserver(toggleSuggestButtonState);
    contentObserver.observe(textarea, { childList: true, characterData: true, subtree: true });


    suggestTitleBtn.onclick = () => uiHandleSuggestTitle(textarea, promptTitleInput, getAISuggestedTitle, suggestTitleBtn);

    const copyBtn = createButton("Copy", `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#4db6ac"><path d="M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z" stroke="#4db6ac" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
    const delBtn = createButton("Delete", `<svg fill="#4db6ac" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#4db6ac"><path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"></path></svg>`);

    copyBtn.onclick = () => handleCopyPrompt(textarea);
    delBtn.onclick = () => uiHandleDelete(index, savedPromptsArray_ref, promptWindow, promptStack, deletePromptFromList);

    buttonContainer.appendChild(copyBtn);
    buttonContainer.appendChild(delBtn);

    const commonEditSaveLogic = (currentEditOrSaveBtn, isCurrentlyNew) => {
      try {
        promptTitleInput.readOnly = false;
        textarea.contentEditable = true;
        promptTitleInput.classList.add('editable-field');
        textarea.classList.add('editable-field');
        if (isCurrentlyNew) {
          promptTitleInput.focus();
        } else {
          promptTitleInput.focus();
        }
        toggleSuggestButtonState();

        currentEditOrSaveBtn.textContent = isCurrentlyNew ? "Save" : "Save Changes";
      } catch (e) {
         console.error("[promptManager] Error setting up editable state in commonEditSaveLogic:", e);
      }

      currentEditOrSaveBtn.onclick = async () => {
        try {
          if (promptTitleInput.value.trim() === "" || textarea.innerText.trim() === "") {
            alert("Title and content cannot be empty."); // This could be a more gentle UI feedback
            return;
          }
          const promptDetailsToSave = {
            pTitle: promptTitleInput.value,
            pContent: textarea.innerText,
          };

          let success = false;
          const oldPromptData = isCurrentlyNew ? null : { ...savedPromptsArray_ref[index] };

          if (isCurrentlyNew) {
            success = await addNewPromptToList(promptDetailsToSave, savedPromptsArray_ref);
          } else { // Saving changes to an existing prompt
            savedPromptsArray_ref[index] = promptDetailsToSave;
            try {
              await updatePromptsInStorage(savedPromptsArray_ref);
              success = true;
              console.log("[promptManager] Successfully updated existing prompt in storage.");
            } catch (storageError) {
              console.error("[promptManager] Error saving changes to existing prompt in storage:", storageError);
              if (oldPromptData) savedPromptsArray_ref[index] = oldPromptData; 
              success = false;
            }
          }

          if (success) {
            showFeedback(promptWindow, "Prompt Saved!");
            promptTitleInput.readOnly = true;
            textarea.contentEditable = false;
            promptTitleInput.classList.remove('editable-field');
            textarea.classList.remove('editable-field');
            
            buttonContainer.removeChild(currentEditOrSaveBtn);
            const editBtn = createButton("Edit", "Edit", "edit-button");
            editBtn.onclick = () => commonEditSaveLogic(editBtn, false);
            buttonContainer.appendChild(editBtn);
          } else {
            showFeedback(promptWindow, "Error saving!");
            promptTitleInput.readOnly = false; // Keep editable if save failed
            textarea.contentEditable = true;
          }
          toggleSuggestButtonState();
        } catch (e) {
          console.error("[promptManager] Error in save/update prompt onclick handler:", e);
          showFeedback(promptWindow, "An unexpected error occurred.");
           // Ensure fields remain editable or revert to a safe state
          promptTitleInput.readOnly = false;
          textarea.contentEditable = true;
        }
      };
    };

    if (isNew) {
      const saveBtn = createButton("Save", "Save");
      buttonContainer.appendChild(saveBtn);
      commonEditSaveLogic(saveBtn, true);
      promptTitleInput.readOnly = false;
      textarea.contentEditable = true;
    } else {
      const editBtn = createButton("Edit", "Edit", "edit-button");
      editBtn.onclick = () => commonEditSaveLogic(editBtn, false);
      buttonContainer.appendChild(editBtn);
    }

    promptStack.appendChild(promptWindow);
    setTimeout(() => {
      promptWindow.classList.add('visible');
    }, 125);
  } catch (e) {
    console.error("[promptManager] Critical error in pushPrompt:", e);
    // Optionally, try to display a generic error message to the user or clean up UI
    if (promptStack && prompt) { // Check if promptStack exists
        try {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `Error loading prompt: ${prompt.pTitle || 'Untitled'}. Please refresh.`;
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '10px';
            promptStack.appendChild(errorDiv);
        } catch (domError) {
            console.error("[promptManager] Failed to display critical error message in UI:", domError);
        }
    }
  }
};
