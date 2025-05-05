import { IPassword } from "@/model/password";
import { getTmpPasswordApi } from "../lib/services/password.service";

type ValidInput = {
  input: HTMLInputElement;
  originalType: string;
}

let isPopupOpen = false;
let isAuthentication = false;
let passwords: IPassword[] = [];
let password: IPassword;
let validInputs: ValidInput[] = [];

document.addEventListener("DOMContentLoaded", async function () {
  const currentUrl = window.location.href;
  let hostname = new URL(currentUrl).hostname;
  if (hostname.startsWith("www.")) {
    hostname = hostname.substring(4);
  }
  try {
    const response = await getTmpPasswordApi(hostname);
    if (response?.data?.length > 0) {
      passwords = response.data;
    }
    isAuthentication = true;
  } catch (error) {
    chrome.runtime.sendMessage({
      action: "ERROR",
      message: `[Content Script] Error: ${JSON.stringify(error)}`,
    });
  }

  password = passwords.find((item: IPassword) => item.is_auto_fill);
  const inputs = document.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input[type="email"], input[type="password"], input[type="tel"]'
  );
  
  if (password) {
    inputs.forEach((input) => {
      addLogoAndAutofill(input);
    });
  } else {
    chrome.runtime.sendMessage({
      action: "LOG",
      message: "[Content Script] Autofill skipped due to invalid or missing password data.",
    });
    inputs.forEach(addLogo); // Add logo even if autofill is skipped
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const newInputs = node.querySelectorAll<HTMLInputElement>(
              'input[type="text"], input[type="email"], input[type="password"], input[type="tel"]'
            );
            newInputs.forEach(addLogo);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});



function addLogoToInput(input: HTMLInputElement): void {
  if (input.parentNode.querySelector(".autofill-logo")) return;
  const validInput: ValidInput = {
    input,
    originalType: input.type,
  };
  validInputs.push(validInput);

  let logo = document.createElement("img");
  // const inputStyle = window.getComputedStyle(input);

  logo.src = chrome.runtime.getURL("/icons/logo.png");
  logo.className = "autofill-logo";
  // logo.style.height = `calc(${inputStyle.height} - 5px)`;
  // logo.style.height = `calc(${inputStyle.}ge- 5px)`;

  const parent = input.parentNode;
  if (parent instanceof HTMLElement) {
    parent.style.position = "relative";
    parent.appendChild(logo);
  }
    logo.addEventListener("click", async () => {
      if (!isAuthentication){
        try {
          const redirectUrl = encodeURIComponent(window.location.href);
          await chrome.runtime.sendMessage({
            action: "OPEN_AUTH_TAB",
            url: chrome.runtime.getURL(`app.html#/auth/sign-in?redirect= + ${redirectUrl}`),
          });
        } catch (error) {
            chrome.runtime.sendMessage({
              action: "ERROR",
              message: `[Content Script] Error: Failed to create tab ${error}`,
            });
        }
        // window.open(chrome.runtime.getURL('app.html#/auth/sign-in'), '_blank');
      } else {
        createPopup(input)
      }
    });
    if (isAuthentication) {
      input.addEventListener("focus", () => createPopup(input));
    }
  
}

function addLogoAndAutofill(input: HTMLInputElement): void {
  switch (input.type) {
    case "email":
    case "tel":
      if (password.username) {
        autofillCredentials(password.username, input);
      }
      addLogoToInput(input);
      break;
    case "password":
      if (password.password) {
        autofillCredentials(password.password, input);
      }
      addLogoToInput(input);
      break;
    case "text":
      if (checkTextInput(input)) {
        autofillCredentials(password.username, input);
        addLogoToInput(input);
      }
      break;
  }
}

function autofillCredentials(value: string, input: HTMLInputElement): void {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function addLogo(input: HTMLInputElement): void{
  switch (input.type) {
    case "email":
    case "tel":
    case "password":
      addLogoToInput(input);
      break;
    case "text":
      if (checkTextInput(input)) {
        addLogoToInput(input);
      }
      break;
  }
}

function checkTextInput(input: HTMLInputElement): boolean{
  const keywords = ["username", "email", "tel", "phone", "login", "signin"];
  const hasMatchingClass = keywords.some((cls) => input.className.toLowerCase().includes(cls));
  
  const hasMatchingName = keywords.some((name) => input.name.toLowerCase().includes(name));

  const hasMatchingId = keywords.some((id) => input.id.toLowerCase().includes(id));

  return hasMatchingClass || hasMatchingName || hasMatchingId;
}

async function createPopup(input: HTMLInputElement): Promise<void> {
  const existingPopup = document.querySelector(".autofill-popup");
  if (isPopupOpen && existingPopup ) {
    closePopup();
  }
  if (isPopupOpen) return;

  const popup = document.createElement("div");
  popup.className = "autofill-popup";

  const inputRect = input.getBoundingClientRect();

  popup.style.top = `${window.scrollY + inputRect.bottom + 5}px`;
  popup.style.left = `${window.scrollX + inputRect.left}px`;
  try {
    const response = await fetch(chrome.runtime.getURL("html/popup.html"));
    const htmlContent = await response.text();
    popup.innerHTML = htmlContent;
    

    const passwordListContainer = popup.querySelector(".autofill-password-list");

    const template = passwordListContainer.querySelector(".autofill-header");

    popup
    .querySelector(".autofill-popup-logo")
    .setAttribute("src", chrome.runtime.getURL("/icons/instagram.png"));

    passwords.forEach((password) => {
      const item = template.cloneNode(true) as Element;
     
      (item.querySelector(".autofill-popup-url") as HTMLElement).textContent =
        password.url || "unknown.com";
      (item.querySelector(".autofill-popup-username") as HTMLElement).textContent =
        password.username;

      // Add click event for autofill
      item.addEventListener("click", () => {
        validInputs.forEach((validInput) => {
          switch (validInput.originalType) {
            case "email":
            case "tel":
            case "text":
              autofillCredentials(password.username, validInput.input);
              break;
            case "password":
              autofillCredentials(password.password, validInput.input);
              break;
          }
        });
        closePopup();
      });

      // Append the updated template
      passwordListContainer.appendChild(item);

    });
    template.remove();
    document.body.appendChild(popup);
    isPopupOpen = true;

  } catch (error) {
    console.error("Failed to load popup HTML:", error);
  }
  isPopupOpen = true;

  document.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const popup = document.querySelector(".autofill-popup");
    const logo = document.querySelector(".autofill-logo");
    if (
      popup &&
      !popup.contains(target) &&
      (!logo || !logo.contains(target)) &&
      !(target instanceof HTMLInputElement) && target !== input
    ) {
      closePopup();
    } else if (popup.contains(target)) {
    }
  });
 
};

function closePopup(): void {
  const popup = document.querySelector(".autofill-popup");
  if (popup) {
    popup.remove();
    isPopupOpen = false;
  }
  }