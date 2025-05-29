// Functions for creating, appending, and removing DOM elements
// for the Prompter panel.

export const createButton = (title, svgContentOrText, additionalClass = "") => {
  try {
    const button = document.createElement("button");
    button.className = `prompt-action-button ${additionalClass}`; 
    button.title = title;
    if (svgContentOrText.startsWith("<svg")) {
      button.innerHTML = svgContentOrText;
    } else {
      button.textContent = svgContentOrText;
    }
    return button;
  } catch (error) {
    console.error("[domManipulator] Error in createButton:", { title, additionalClass, error });
    // Return a placeholder or throw to make the error more visible upstream
    const errorButton = document.createElement("button");
    errorButton.textContent = "Error";
    errorButton.disabled = true;
    return errorButton;
  }
};

export const createSuggestTitleButton = () => {
  try {
    const button = document.createElement("button");
    button.className = "suggest-title-button";
    button.title = "Suggest a title based on content";
    button.textContent = "✨ Suggest Title";
    button.disabled = true; 
    return button;
  } catch (error) {
    console.error("[domManipulator] Error in createSuggestTitleButton:", error);
    const errorButton = document.createElement("button");
    errorButton.textContent = "Error";
    errorButton.disabled = true;
    return errorButton;
  }
};

export const createPrompterPanelShell = () => {
  try {
    const prompterPanel = document.createElement("div");
    prompterPanel.className = "prompter-panel-base prompter-panel"; 

    const titleElement = document.createElement("h2");
    titleElement.className = "prompter-title"; 
    titleElement.id = "slide-over-title";
    titleElement.innerText = "Your Templates";
    prompterPanel.appendChild(titleElement);

    const addPromptBtn = document.createElement("button");
    addPromptBtn.className = "add-prompt-button"; 
    addPromptBtn.title = "New Prompt";
    addPromptBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
    </svg>`;
    titleElement.appendChild(addPromptBtn);

    const promptStack = document.createElement("div");
    prompterPanel.appendChild(promptStack);

    return {
      prompterPanel,
      titleElement,
      addPromptBtn,
      promptStack,
    };
  } catch (error) {
    console.error("[domManipulator] Error in createPrompterPanelShell:", error);
    // Return a minimal fallback or throw
    const errorPanel = document.createElement("div");
    errorPanel.textContent = "Error loading prompter panel.";
    return { 
        prompterPanel: errorPanel, 
        titleElement: null, 
        addPromptBtn: null, 
        promptStack: null 
    };
  }
};

export const createPromptWindowElements = (prompt) => {
  try {
    const { pTitle, pContent } = prompt;

    const promptWindow = document.createElement("div");
    promptWindow.className = "prompt-window"; 

    const titleContainer = document.createElement("div");
    titleContainer.className = "prompt-title-container"; 
    
    const promptTitleInput = document.createElement("input");
    promptTitleInput.className = "prompt-title-input"; 
    promptTitleInput.value = pTitle;
    promptTitleInput.placeholder = "Enter Title";
    titleContainer.appendChild(promptTitleInput);

    const suggestTitleBtn = createSuggestTitleButton();
    titleContainer.appendChild(suggestTitleBtn);
    
    promptWindow.appendChild(titleContainer);

    const textarea = document.createElement("div");
    textarea.className = "prompt-content-textarea"; 
    textarea.contentEditable = true; 
    textarea.innerText = pContent;
    promptWindow.appendChild(textarea);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "prompt-button-container"; 
    promptWindow.appendChild(buttonContainer);

    if (pTitle !== "" || pContent !== "") { 
      promptTitleInput.readOnly = true;
      textarea.contentEditable = false;
    } else {
      promptTitleInput.readOnly = false; 
    }

    return {
      promptWindow,
      promptTitleInput,
      suggestTitleBtn,
      textarea,
      buttonContainer,
    };
  } catch (error) {
    console.error("[domManipulator] Error in createPromptWindowElements:", { prompt, error });
    const errorWindow = document.createElement("div");
    errorWindow.textContent = "Error loading prompt window.";
    errorWindow.className = "prompt-window visible"; // Make it visible
    return { 
        promptWindow: errorWindow, 
        promptTitleInput: null, 
        suggestTitleBtn: null, 
        textarea: null, 
        buttonContainer: null 
    };
  }
};

export const createFeedbackMessageElement = (message) => {
  try {
    const feedbackElement = document.createElement("div");
    feedbackElement.className = "prompt-feedback-message";
    feedbackElement.textContent = message;
    return feedbackElement;
  } catch (error) {
    console.error("[domManipulator] Error in createFeedbackMessageElement:", { message, error });
    const errorFeedback = document.createElement("div");
    errorFeedback.textContent = "Error displaying feedback.";
    return errorFeedback;
  }
};
