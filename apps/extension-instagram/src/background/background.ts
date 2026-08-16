import { createMessage, isProtocolMessage } from "@archiveflow/protocol";

/**
 * MV3 service worker shell. No page access / Instagram scraping yet — that
 * is out of scope for P001. This only proves the messaging envelope and the
 * worker lifecycle are wired up.
 */
chrome.runtime.onInstalled.addListener(() => {
  const ping = createMessage("extension.installed", { at: new Date().toISOString() });
  if (isProtocolMessage(ping)) {
    console.info("[archiveflow] extension-instagram background worker ready", ping);
  }
});
