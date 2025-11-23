#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { randomUUID } from "crypto";

// -----------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------
const BASE = "https://esaip.alcuin.com";
const LOGIN_URL = BASE + "/OpDotNet/Noyau/Login.aspx?";
const AGENDA_URL = BASE + "/Eplug/Agenda/Agenda.asp";

// -----------------------------------------------------------
// CREDENTIALS
// -----------------------------------------------------------
function loadCredentials() {
  // On lit credentials.txt dans le dossier courant
  const credPath = path.join(process.cwd(), "credentials.txt");

  if (!fs.existsSync(credPath)) {
    throw new Error(`credentials.txt introuvable : ${credPath}`);
  }
  const lines = fs.readFileSync(credPath, "utf8")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("credentials.txt doit contenir 2 lignes : login puis mot de passe");
  }
  return { user: lines[0], pwd: lines[1] };
}

// -----------------------------------------------------------
// HTML HELPERS
// -----------------------------------------------------------
function getViewState($) {
  const vs = $('input[name="__VIEWSTATE"]').attr("value");
  const ev = $('input[name="__EVENTVALIDATION"]').attr("value");
  const vg = $('input[name="__VIEWSTATEGENERATOR"]').attr("value");

  if (!vs || !ev || !vg) {
    throw new Error("VIEWSTATE manquant sur la page de login");
  }
  return {
    __VIEWSTATE: vs,
    __EVENTVALIDATION: ev,
    __VIEWSTATEGENERATOR: vg
  };
}

// -----------------------------------------------------------
// LOGIN
// -----------------------------------------------------------
async function login(client) {
  const { user, pwd } = loadCredentials();

  const r1 = await client.get(LOGIN_URL);
  const $ = cheerio.load(r1.data);
  const state = getViewState($);

  const payload = new URLSearchParams({
    "__VIEWSTATE": state.__VIEWSTATE,
    "__EVENTVALIDATION": state.__EVENTVALIDATION,
    "__VIEWSTATEGENERATOR": state.__VIEWSTATEGENERATOR,
    "UcAuthentification1$UcLogin1$txtLogin": user,
    "UcAuthentification1$UcLogin1$txtPassword": pwd,
    "UcAuthentification1$UcLogin1$btnEntrer": "Connexion"
  });

  const r2 = await client.post(LOGIN_URL, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  if (String(r2.request?.res?.responseUrl || r2.config.url).includes("Login")) {
    throw new Error("Login failed");
  }

  console.log("[OK] Logged in");
}

async function getAgendaUrl(client) {
  const aspUrl =
    BASE +
    "/OpDotnet/commun/Login/aspxtoasp.aspx?url=/Eplug/Agenda/Agenda.asp?IdApplication=190&TypeAcces=Utilisateur&IdLien=649";

  const r = await client.get(aspUrl);
  // axios suit les redirects; la dernière URL contient le token
  return r.request.res.responseUrl;
}

// -----------------------------------------------------------
// LOAD TABLE VIEW
// -----------------------------------------------------------
async function loadTableView(client, dateStr, agendaUrl) {
  // keep session alive
  await client.get(agendaUrl);

  const payload = new URLSearchParams({
    "TypVis": "Vis-Tab.xsl",
    "date": dateStr,
    "BValider": "OK"
  });

  const r2 = await client.post(agendaUrl, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  return r2.data;
}

async function followAspxtoasp(client, html) {
  const $ = cheerio.load(html);
  const form = $("form").first();
  if (!form.length) throw new Error("Pas de formulaire aspxtoasp");

  const action = form.attr("action");
  const payload = {};

  form.find("input").each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).attr("value") || "";
    if (name) payload[name] = value;
  });

  const url = new URL(action, BASE).toString();

  const r = await client.post(url, new URLSearchParams(payload).toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  return r.data;
}

// -----------------------------------------------------------
// NEXT MONTH (working version)
// -----------------------------------------------------------
async function loadNextMonth(client, html, agendaUrl) {
  const $ = cheerio.load(html);

  const links = $("a[onclick*=\"NavDat(\"]");
  if (!links.length) throw new Error("Impossible de trouver un bouton NavDat");

  let nextLink = null;

  links.each((_, a) => {
    const img = $(a).find("img");
    const src = img.attr("src") || "";
    if (src.includes("FlecheDroite")) {
      nextLink = a;
      return false;
    }
  });

  if (!nextLink) {
    nextLink = links.get(links.length - 1);
  }

  const onclick = $(nextLink).attr("onclick") || "";
  const num = onclick.replace(/\D/g, "");
  if (!num) throw new Error("NumDat introuvable dans l'onclick NavDat");

  const payload = new URLSearchParams({
    "NumDat": num,
    "TypVis": "Vis-Tab.xsl",
    "BValider": "OK"
  });

  let r = await client.post(agendaUrl, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    maxRedirects: 5
  });

  let htmlOut = r.data;

  // Si Alcuin renvoie une page aspxtoasp, il faut la suivre
  if (typeof htmlOut === "string" && htmlOut.includes("aspxtoasp.asp")) {
    htmlOut = await followAspxtoasp(client, htmlOut);
  }

  return htmlOut;
}

// -----------------------------------------------------------
// PARSE TABLE VIEW
// -----------------------------------------------------------
function parseTable(html) {
  const $ = cheerio.load(html);
  const rows = $("tr[id*=\"TableDatas\"]");
  const events = [];

  rows.each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length < 7) return;

    let rawTitle = $(cols[1]).text().trim();

    // Nettoyage des titres
    // Supprimer "TA;TA"
    rawTitle = rawTitle.replace(/TA;TA/gi, "").trim();

    // Supprimer "Cours -"
    rawTitle = rawTitle.replace(/^Cours\s*-\s*/i, "");

    // Transformer "Cours Gr 1 -" → "Gr1 -" et "Cours Gr 2 -" → "Gr2 -"
    rawTitle = rawTitle.replace(/^Cours\s*Gr\s*1\s*-\s*/i, "Gr1 - ");
    rawTitle = rawTitle.replace(/^Cours\s*Gr\s*2\s*-\s*/i, "Gr2 - ");

    // Déterminer une couleur spécifique selon le type
    let color = "#66B2FF"; // couleur par défaut

    if (/^TA\b/i.test(rawTitle)) {
      color = "#989ea6";
    } else if (/^Soutien\s*-\s*/i.test(rawTitle)) {
      color = "#80ffb0";
    } else if (/^Information\s*-\s*/i.test(rawTitle)) {
      color = "#808fff";
    } else if (/^Oral\s*-\s*/i.test(rawTitle)) {
      color = "#f5bd00";
    }

    const title = rawTitle.trim();
    const dateStr = $(cols[4]).text().trim();
    const startStr = $(cols[5]).text().trim().replace("h", ":").replace(/\s+/g, "");
    const endStr = $(cols[6]).text().trim().replace("h", ":").replace(/\s+/g, "");

    // dateStr format dd/mm/yyyy
    const [dd, mm, yyyy] = dateStr.split("/");
    if (!dd || !mm || !yyyy) return;

    const dateIso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    const startIso = `${dateIso}T${startStr.padStart(5, "0")}`;

    // duration in minutes
    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);
    if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return;

    const duration = (eh * 60 + em) - (sh * 60 + sm);
    if (duration <= 0) return;

    events.push({
      id: randomUUID(),
      title,
      start: startIso,
      duration,
      recurrence: "none",
      typeId: "",
      color: color
    });
  });

  return events;
}

// -----------------------------------------------------------
// MAIN
// -----------------------------------------------------------
async function main() {
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
      "User-Agent": "Mozilla/5.0"
    },
    timeout: 30000
  }));

  await login(client);
  const agendaUrl = await getAgendaUrl(client);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dateStr = `${year}-${month}-01`;

  let html = await loadTableView(client, dateStr, agendaUrl);

  // suivre la redirection aspxtoasp
  html = await followAspxtoasp(client, html);

  const dataCurrent = parseTable(html);

  // charger mois suivant
  const htmlNext = await loadNextMonth(client, html, agendaUrl);
  const dataNext = parseTable(htmlNext);

  const events = [...dataCurrent, ...dataNext];

  // DEBUG temporaire (comme en python)
  const hasDecember = events.some(ev => ev.start.includes("-12-"));
  if (!hasDecember) {
    console.log("⚠️  ATTENTION : Aucun cours de décembre détecté. Le chargement du mois suivant a probablement échoué.");
  }

  const finalJson = {
    storagePath: "MyDeskOnline-main",
    calendar: { events }
  };

  fs.writeFileSync(
    path.join(process.cwd(), "timetable.json"),
    JSON.stringify(finalJson, null, 2),
    "utf8"
  );

  console.log("✔ Emploi du temps (2 mois) sauvegardé dans timetable.json");
}

main().catch(err => {
  console.error("Erreur scraper:", err.message);
  process.exit(1);
});