import fs from 'fs';

async function main() {
  try {
    const res = await fetch("https://aquashield-monitoring.lovable.app/assets/index-CDkQWjQ1.js");
    const text = await res.text();
    const navItems = ["Home", "Dashboard", "Monitor Lake", "Change Detection", "GIS & Cadastral", "Risk & Alerts", "Field Verification", "Reports", "AI/ML", "About"];
    console.log("Checking nav items present:");
    for (const item of navItems) {
      console.log(item, ":", text.includes(item));
    }

    const titleMatches = text.match(/title:\s*"[^"]+"/g) || [];
    console.log("Titles found:", titleMatches.slice(0, 15));

    // Find any descriptions or subtitles
    const matches = text.match(/(?:Satellite-Based|Sentinel-2|NDWI|Water Area|Encroachment)[^"{};]{10,120}/g) || [];
    console.log("Keywords snippet:", matches.slice(0, 8));
  } catch (e) {
    console.error(e);
  }
}
main();
