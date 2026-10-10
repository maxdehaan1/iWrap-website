// Neemt de film van de homepage beeldje voor beeldje op en maakt er een MP4 van.
//
//   cd video && npm install        (eenmalig)
//   npm run opname                  -> iwrap-zo-werkt-het.mp4
//   node opname.mjs --beelden 0,4,8 -> losse PNG's in beelden/, om te bekijken
//
// Het script start zelf een lokale server (poort 8011), opent de homepage in je
// eigen Google Chrome, haalt alles behalve de film weg en zet de film op elk
// tijdstip neer met window.iwrapFilm.teken(t). Draai eerst python3 build.py als
// je iets aan de site veranderd hebt.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import ffmpeg from "ffmpeg-static";

const HIER = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HIER, "..");
const POORT = 8011;
const BREED = 1920, HOOG = 1080, FPS = 30;
// Na de film blijft de eindkaart nog even staan: in een appje of mail moet
// iemand de tijd hebben om hem te lezen. Op de site blijft hij gewoon staan.
const NASTAAN = 1;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const UIT = join(HIER, "iwrap-zo-werkt-het.mp4");

const arg = process.argv.indexOf("--beelden");
const beelden = arg > 0 ? process.argv[arg + 1].split(",").map(Number) : null;

const server = spawn("python3", ["serve.py"], { cwd: ROOT, env: { ...process.env, POORT: String(POORT) }, stdio: "ignore" });
const klaar = () => server.kill();
process.on("exit", klaar);

async function wachtOpServer() {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://localhost:${POORT}/`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("De lokale server start niet. Draait er al iets op poort " + POORT + "?");
}

await wachtOpServer();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: BREED, height: HOOG, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${POORT}/?opname`, { waitUntil: "networkidle0" });
await page.evaluate(async (b, h) => {
  await document.fonts.ready;
  const film = document.querySelector(".film");
  document.body.replaceChildren(film);
  document.body.style.margin = "0";
  film.classList.add("opname");
  film.style.width = b + "px";
  film.style.height = h + "px";
}, BREED, HOOG);
const duur = await page.evaluate(() => window.iwrapFilm.duur);

async function beeld(t) {
  await page.evaluate((t) => window.iwrapFilm.teken(t), t);
  return page.screenshot({ type: "png", clip: { x: 0, y: 0, width: BREED, height: HOOG } });
}

if (beelden) {
  const map = join(HIER, "beelden");
  mkdirSync(map, { recursive: true });
  for (const t of beelden) {
    const pad = join(map, `t-${t.toFixed(2).padStart(5, "0")}.png`);
    writeFileSync(pad, await beeld(t));
    console.log(pad);
  }
} else {
  const enc = spawn(ffmpeg, [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", "16",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    UIT
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const totaal = Math.round((duur + NASTAAN) * FPS);
  for (let i = 0; i < totaal; i++) {
    const png = await beeld(Math.min(i / FPS, duur));
    if (!enc.stdin.write(png)) await new Promise((r) => enc.stdin.once("drain", r));
    if (i % FPS === 0) process.stdout.write(`\r${Math.round((i / totaal) * 100)}%`);
  }
  enc.stdin.end();
  await new Promise((r, f) => enc.on("close", (c) => (c === 0 ? r() : f(new Error("ffmpeg stopte met code " + c)))));
  console.log(`\r${UIT}`);
}

await browser.close();
klaar();
