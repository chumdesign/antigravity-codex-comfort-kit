(function () {
  const STORAGE_KEY = "antigravity-codex-comfort-mode";
  const HIDE_KEY = "antigravity-codex-comfort-hidden";
  const MODES = ["compact", "comfort", "spacious"];
  const DEFAULT_MODE = "comfort";
  const HOST_CLASS = "ag-comfort-composer-host";

  function applyMode(mode) {
    const normalized = MODES.includes(mode) ? mode : DEFAULT_MODE;
    document.documentElement.setAttribute("data-codex-comfort-mode", normalized);
    window.localStorage.setItem(STORAGE_KEY, normalized);
  }

  function updateButtons(root, currentMode) {
    root.querySelectorAll("[data-mode]").forEach((button) => {
      const isActive = button.getAttribute("data-mode") === currentMode;
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("is-active", isActive);
    });
  }

  function setHidden(root, hidden) {
    root.classList.toggle("is-hidden", hidden);
    root.classList.toggle("is-collapsed", hidden);
    window.localStorage.setItem(HIDE_KEY, hidden ? "1" : "0");
  }

  function findComposerHost() {
    const inlineInput = document.querySelector(".request-input-panel__inline-freeform");
    if (inlineInput instanceof HTMLElement) {
      return (
        inlineInput.closest("[class*='composer']") ||
        inlineInput.closest("[class*='request-input-panel']") ||
        inlineInput.parentElement
      );
    }

    const footer = document.querySelector(".composer-footer");
    if (footer instanceof HTMLElement) {
      return footer.closest("[class*='composer']") || footer.parentElement || footer;
    }

    const fallback = document.querySelector("[class*='composerSurface'], [class*='homeShell']");
    return fallback instanceof HTMLElement ? fallback : null;
  }

  function findSendButton(host) {
    if (!(host instanceof HTMLElement)) {
      return null;
    }

    const buttons = Array.from(host.querySelectorAll("button")).filter((button) => {
      if (!(button instanceof HTMLElement)) {
        return false;
      }

      const rect = button.getBoundingClientRect();
      return rect.width > 20 && rect.height > 20 && rect.bottom > 0 && rect.right > 0;
    });

    if (!buttons.length) {
      return null;
    }

    return buttons.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return (rectB.bottom + rectB.right) - (rectA.bottom + rectA.right);
    })[0];
  }

  function positionNearSendButton(root, sendButton) {
    const rect = sendButton.getBoundingClientRect();
    const buttonSize = 38;
    const top = Math.max(12, Math.round(rect.top - buttonSize - 12));
    const left = Math.round(rect.left + rect.width / 2 - buttonSize / 2);

    root.style.top = `${top}px`;
    root.style.left = `${left}px`;
    root.style.right = "auto";
    root.classList.remove("is-docked");
    root.classList.add("is-tracked-to-send");
    root.classList.remove("is-floating");
    if (root.parentElement !== document.body) {
      document.body.appendChild(root);
    }
  }

  function dockSwitcher(root) {
    const host = findComposerHost();
    const sendButton = findSendButton(host);

    if (sendButton instanceof HTMLElement) {
      if (host instanceof HTMLElement) {
        host.classList.add(HOST_CLASS);
      }
      positionNearSendButton(root, sendButton);
      return;
    }

    if (!(host instanceof HTMLElement)) {
      root.classList.remove("is-docked");
      root.classList.remove("is-tracked-to-send");
      root.classList.add("is-floating");
      if (root.parentElement !== document.body) {
        document.body.appendChild(root);
      }
      return;
    }

    host.classList.add(HOST_CLASS);
    root.classList.remove("is-floating");
    root.classList.remove("is-tracked-to-send");
    root.classList.add("is-docked");
    root.style.left = "";
    root.style.right = "";
    root.style.top = "";

    if (root.parentElement !== host) {
      host.appendChild(root);
    }
  }

  function buildSwitcher() {
    if (document.getElementById("antigravity-codex-comfort-switcher")) {
      return;
    }

    const root = document.createElement("div");
    root.id = "antigravity-codex-comfort-switcher";
    root.className = "antigravity-codex-comfort-switcher";
    root.innerHTML = [
      '<button type="button" class="comfort-toggle" data-action="toggle-panel" aria-label="Toggle reading mode switcher">Aa</button>',
      '<div class="comfort-panel" role="group" aria-label="Reading density">',
      '  <button type="button" data-mode="compact">Compact</button>',
      '  <button type="button" data-mode="comfort">Comfort</button>',
      '  <button type="button" data-mode="spacious">Spacious</button>',
      "  <button type=\"button\" data-action=\"hide\">Hide</button>",
      "</div>"
    ].join("");

    root.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const mode = target.getAttribute("data-mode");
      const action = target.getAttribute("data-action");

      if (mode) {
        applyMode(mode);
        updateButtons(root, mode);
      }

      if (action === "toggle-panel") {
        if (root.classList.contains("is-hidden")) {
          setHidden(root, false);
          return;
        }

        root.classList.toggle("is-collapsed");
      }

      if (action === "hide") {
        setHidden(root, true);
      }
    });

    dockSwitcher(root);

    const savedMode = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_MODE;
    const hidden = window.localStorage.getItem(HIDE_KEY) === "1";
    applyMode(savedMode);
    updateButtons(root, savedMode);
    setHidden(root, hidden);

    const observer = new MutationObserver(() => {
      dockSwitcher(root);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("keydown", (event) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "a") {
        setHidden(root, false);
        root.classList.remove("is-collapsed");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSwitcher, { once: true });
  } else {
    buildSwitcher();
  }
})();
