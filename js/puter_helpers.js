async function waitForPuter(timeout = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (typeof puter !== "undefined" && puter && puter.ai && typeof puter.ai.chat === "function") {
        resolve(true);
        return;
      }
      if (Date.now() - start > timeout) {
        resolve(false);
        return;
      }
      setTimeout(check, 100);
    })();
  });
}

function extractAssistantText(response) {
  try {
    if (!response) return null;
    if (response.message && typeof response.message.content === "string") return response.message.content;
    if (Array.isArray(response.choices) && response.choices[0] && response.choices[0].message && typeof response.choices[0].message.content === "string") return response.choices[0].message.content;
    if (Array.isArray(response.choices) && response.choices[0] && typeof response.choices[0].text === "string") return response.choices[0].text;
    if (typeof response.text === "string") return response.text;
    if (response.result && typeof response.result === "string") return response.result;
    if (response.output && typeof response.output === "string") return response.output;

    // Fallback
    const val = findLikelyTextInObject(response);
    if (val) return val;
    return JSON.stringify(response);
  } catch (e) { return null; }
}

function findLikelyTextInObject(obj) {
  try {
    if (!obj || typeof obj !== "object") return null;
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (typeof v === "string" && v.length > 10) return v;
      if (typeof v === "object" && v !== null) {
        if (v.content && typeof v.content === "string") return v.content;
        if (v.message && v.message.content && typeof v.message.content === "string") return v.message.content;
      }
    }
    return null;
  } catch (e) { return null; }
}
