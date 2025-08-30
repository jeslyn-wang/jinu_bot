function detectEmotion(text) {
  if (!text || typeof text !== "string") return "neutral";

  const normalizedText = text.toLowerCase();

  const emotions = {
    happy: ["great","fun","love","yay","awesome","joy","excited", "good", "goodnight", "hi", "hey", "hello"],
    sad: ["sorry","sad","unhappy","depress","lonely","bad","down","miserable","heartbroken","shadow","puppet"],
    angry: ["angry","mad","upset","hate","annoyed","frustrated","furious","puppet","master","power","shadow","string","gwi-ma"],
    surprised: ["wow","surprise","amazing","whoa","oh my","shocked","unbelievable","astonished"],
    flirty: ["cute", "smooth", "blush", "toes", "spark","charm","steal","sweet","babe","rumi","charming","darling","heart","crush","fire","love","😉","😍"],
    pensive: ["think","contemplate","hm", "hmm", "thoughtful","consider","brooding","musing"]
  };

  const votes = { happy:0,sad:0,angry:0,surprised:0,flirty:0,pensive:0 };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = normalizedText.match(regex);
      if (matches) votes[emotion] += matches.length;
    }
  }

  if (normalizedText.includes("!")) votes.happy += 1;
  if (normalizedText.includes("...")) votes.pensive += 1;

  const emojiMap = { "😄":"happy","🙂":"happy","😢":"sad","😠":"angry","😲":"surprised","😉":"flirty","😍":"flirty" };
  for (const [emoji, emotion] of Object.entries(emojiMap)) {
    const matches = normalizedText.match(new RegExp(`${emoji}`,"g"));
    if (matches) votes[emotion] += matches.length;
  }

  const sorted = Object.entries(votes).sort((a,b)=>b[1]-a[1]);
  return sorted[0][1]>0 ? sorted[0][0] : "neutral";
}

function updateCharacter(emotion) {
  const characterImg = document.getElementById("character");
  let imgSrc = "images/neutral_jinu.png";

  switch(emotion){
    case "happy": imgSrc = "images/jinu_happy.png"; break;
    case "sad": imgSrc = "images/jinuface.jpeg"; break;
    case "angry": imgSrc = "images/jinuface.jpeg"; break;
    case "flirty": imgSrc = "images/jinu_flirty.png"; break;
    case "pensive": imgSrc = "images/jinuface.jpeg"; break;
    case "surprised": imgSrc = "images/jinuface.jpeg"; break;
    default: imgSrc = "images/neutral_jinu.png";
  }

  characterImg.src = imgSrc;

}
