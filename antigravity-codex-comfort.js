(function () {
  const STORAGE_KEY = "antigravity-codex-comfort-mode";
  const MODES = ["small", "medium", "big"];
  const DEFAULT_MODE = "medium";
  const SETTINGS_MENU_CLASS = "ag-comfort-settings-menu";

  function normalizeMode(mode) {
    if (mode === "compact") {
      return "small";
    }

    if (mode === "comfort") {
      return "medium";
    }

    if (mode === "spacious") {
      return "big";
    }

    return MODES.includes(mode) ? mode : DEFAULT_MODE;
  }

  function applyMode(mode) {
    const normalized = normalizeMode(mode);
    document.documentElement.setAttribute("data-codex-comfort-mode", normalized);
    window.localStorage.setItem(STORAGE_KEY, normalized);
  }

  function updateButtons(root, currentMode) {
    root.querySelectorAll("[data-mode]").forEach((button) => {
      const isActive = button.getAttribute("data-mode") === normalizeMode(currentMode);
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("is-active", isActive);
    });
  }

  function injectSettingsMenu() {
    const anchor = Array.from(
      document.querySelectorAll("button, [role='menuitem'], [data-radix-collection-item]")
    ).find((element) => /codex settings/i.test(element.textContent || ""));

    if (!(anchor instanceof HTMLElement)) {
      return;
    }

    const parent = anchor.parentElement;
    if (!(parent instanceof HTMLElement)) {
      return;
    }

    if (parent.querySelector(`.${SETTINGS_MENU_CLASS}`)) {
      updateButtons(parent, document.documentElement.getAttribute("data-codex-comfort-mode") || DEFAULT_MODE);
      return;
    }

    const container = document.createElement("div");
    container.className = SETTINGS_MENU_CLASS;
    container.innerHTML = [
      '<div class="ag-comfort-settings-title">Text size</div>',
      '<div class="ag-comfort-settings-actions">',
      '  <button type="button" data-mode="big">Large</button>',
      '  <button type="button" data-mode="medium">Medium</button>',
      '  <button type="button" data-mode="small">Small</button>',
      "</div>"
    ].join("");

    container.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const mode = target.getAttribute("data-mode");
      if (!mode) {
        return;
      }

      applyMode(mode);
      updateButtons(container, mode);
    });

    anchor.insertAdjacentElement("afterend", container);
    updateButtons(container, document.documentElement.getAttribute("data-codex-comfort-mode") || DEFAULT_MODE);
  }

  function buildSwitcher() {
    const savedMode = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_MODE;
    applyMode(savedMode);
    injectSettingsMenu();

    const observer = new MutationObserver(() => {
      injectSettingsMenu();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSwitcher, { once: true });
  } else {
    buildSwitcher();
  }
})();
