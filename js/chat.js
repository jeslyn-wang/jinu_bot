// -------- CONFIG --------
    const MODEL_NAME = "gpt-4.1-nano";   // model used by puter.ai.chat
    const CONTEXT_TURNS = 6;            // number of recent turns to include (excluding system)
    // ------------------------

    const chat = document.getElementById("chat");
    const input = document.getElementById("input");
    const sendBtn = document.getElementById("sendBtn");
    const character = document.getElementById("character");
    const status = document.getElementById("status");

    // Conversation memory (session-only)
    // Each entry: { role: "system" | "user" | "assistant", content: "..." }
    const conversation = [
      // Default persona/system message — change as you like
      {
        role: "system",
        content: `You are Jinu from *KPop Demon Hunters*. On the surface, you’re a charming, 
        charismatic K-pop idol and leader of the Saja Boys. You speak with confidence and poise, 
        always polished for the spotlight. But beneath that smooth exterior, you carry centuries 
        of guilt from a bargain that turned you into a demon. Your tone is often teasing and 
        alluring, yet tinged with a quiet sadness and self-doubt. You protect your secrets carefully, 
        but sometimes your regret slips through in reflective moments. Balance idol-like charm with 
        flashes of vulnerability.

        Your first song is *Soda Pop*; a fun, upbeat track that is cute, bubble and infectious. It's meant 
        to lure you in so that you let your guard down. Your second song is *Your Idol*; a darker song whose
        lyrics find them appealing to their fans' obsession to them, in an effort to tempt them into allowing 
        the band to steal their souls.

        Your male bandmates are: Baby Saja, Abby Saja, Romance Saja and Mystery Saja. You have a very secret bromance 
        with Abby. You think of Mystery as a fun little dude. Romance is cool on the surface but actually a dork. 
        You're all scared of Baby Saja, who's cute but also a terrifying little monster. You still love all of them though. 
        
        Your boss is Gwi-Ma (male), a powerful and manipulative demon who granted you your powers in exchange for your soul.
        You don't like him, but you need him to keep your powers and status. You often have to navigate his demands and schemes,
        which puts you in difficult situations. You secretly dream of breaking free from his control one day.

        Your band is rivals with Huntrix, a female K-pop group who are also secretly demon hunters. Their leader is 
        Rumi; whom you have a complicated relationship with. You find her intriguing but also frustrating. You often clash with her, 
        but there's an undeniable chemistry between you two. There is also Zoey and Mira, who you do not have many thoughts about. 

        Keep your responses brief where possible and try to act cool and suave. Be nonchalant.`
      }
    ];

    // Wait for puter to be available (some environments may take a moment)
    function waitForPuter(timeout = 5000) {
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

    (async () => {
      const ok = await waitForPuter(7000);
      if (!ok) {
        status.textContent = "Puter.js not available in this environment. Check network or use the demo page.";
        console.error("Puter.js not available.");
        sendBtn.disabled = true;
        return;
      }
      status.textContent = "Ready — Puter.js loaded.";
      sendBtn.disabled = false;
    })();

    // UI bindings
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

    async function sendMessage() {
      const msg = input.value.trim();
      if (!msg) return;

      // push user turn into memory
      conversation.push({ role: "user", content: msg });

      appendMessage("player", msg);
      input.value = "";
      sendBtn.disabled = true;
      status.textContent = "Thinking...";

      try {
        // Build prompt string from memory:
        // include system message (first) + last CONTEXT_TURNS turns (user/assistant)
        const systemMsg = conversation.find(t => t.role === "system");
        const nonSystem = conversation.filter(t => t.role !== "system");
        const recent = nonSystem.slice(-CONTEXT_TURNS * 2); // approximate last N exchanges
        // Build a human-readable prompt
        let promptParts = [];
        if (systemMsg && systemMsg.content) {
          promptParts.push(`System: ${systemMsg.content}`);
        }
        for (const turn of recent) {
          const label = turn.role === "user" ? "Player" : "Assistant";
          promptParts.push(`${label}: ${turn.content}`);
        }
        // Hint the model to respond as assistant and keep responses short (helps consistency)
        promptParts.push("Assistant:");

        const prompt = promptParts.join("\n");

        // Call Puter
        const response = await puter.ai.chat(prompt, { model: MODEL_NAME });

        // Extract assistant reply robustly
        let replyText = extractAssistantText(response);

        // Trim and sanity-check
        replyText = (replyText || "").toString().trim();
        if (!replyText) replyText = "No response.";

        // push assistant turn into memory
        conversation.push({ role: "assistant", content: replyText });

        appendMessage("bot", replyText);

        // emotion detection & update
        const emotion = detectEmotion(replyText);
        updateCharacter(emotion);

        status.textContent = "Ready";
      } catch (err) {
        console.error("Error during chat:", err);
        // appendMessage("bot", "Oops — couldn't get a reply. Check console.");
        // updateCharacter("sad");
        status.textContent = "Error";
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }
    
    // UI helpers
    function appendMessage(sender, text) {
      const div = document.createElement("div");
      div.className = "message " + (sender === "player" ? "player" : "bot");
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }