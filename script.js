document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => { if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'c' || e.key === 'i' || e.key === 'j')) e.preventDefault(); });

let currentLang = localStorage.getItem('lang') || 'ru';
let currentTZ = (() => {
    const stored = localStorage.getItem('tz');
    if (stored === '3' || stored === null || stored === undefined) {
        localStorage.setItem('tz', '7');
        return '7';
    }
    return stored;
})();

const GAME_TZ = 7;

function getNow() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const offset = parseFloat(currentTZ) || 0;
    return new Date(utc + (3600000 * offset));
}

function getGameNow() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * GAME_TZ));
}

function getServerNow() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * -2));
}

function translateTime(timeStr) {
    const [h, m, s] = timeStr.split(':').map(Number);
    const offsetDiff = (parseFloat(currentTZ) || 0) - GAME_TZ;
    let userH = h + offsetDiff;
    let dayShift = 0;
    while (userH >= 24) { userH -= 24; dayShift++; }
    while (userH < 0) { userH += 24; dayShift--; }
    const pad = (n) => n.toString().padStart(2, '0');
    return { time: `${pad(userH)}:${pad(m)}:${pad(s)}`, dayShift: dayShift };
}

function t(path, data = {}) {
    const parts = path.split('.');
    let text = i18n[currentLang];
    for (const p of parts) {
        text = text ? text[p] : undefined;
    }
    if (text === undefined) text = path;
    if (typeof text === 'string') {
        for (let k in data) {
            text = text.replace(`{${k}}`, data[k]);
        }
    }
    return text;
}

function translateEvent(name) {
    return i18n[currentLang].events[name] || name;
}

function buildFixedCalendar() {
    const entries = [];
    for (let i = 0; i < rawCalendar.length; i++) {
        const [dayStr, timeStr, eventName] = rawCalendar[i];
        const dayNum = parseInt(dayStr.split(" ")[1]);
        const tr = translateTime(timeStr);
        entries.push({
            dayNum: dayNum,
            time: tr.time,
            event: translateEvent(eventName)
        });
    }
    return entries;
}

function getGameDayCorrected() {
    const now = getGameNow();
    let d = now.getDay();
    if (now.getHours() < 5) d = (d + 6) % 7;
    return {0:1,1:2,2:3,3:4,4:5,5:6,6:7}[d];
}

function getWeekdayName() {
    const now = getNow();
    let d = now.getDay();
    return i18n[currentLang].days[d];
}

function formatTime(seconds) {
    seconds = Math.floor(Math.abs(seconds));
    const d = Math.floor(seconds / 86400);
    seconds %= 86400;
    const h = Math.floor(seconds / 3600);
    seconds %= 3600;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${d} ${t('ui.st_d')} ${h} ${t('ui.st_h')} ${m} ${t('ui.st_m')} ${s} ${t('ui.st_s')}`;
}

function getTimeToEvent(eventName) {
    const now = getNow();
    const userDayNow = {0:1,1:2,2:3,3:4,4:5,5:6,6:7}[now.getDay()];
    let bestFuture = null;
    for (let i = 0; i < rawCalendar.length; i++) {
        const [dayStr, timeStr, evName] = rawCalendar[i];
        if (evName !== eventName) continue;
        const dayNum = parseInt(dayStr.split(" ")[1]);
        const [h_game] = timeStr.split(':').map(Number);
        let calDayNum = dayNum;
        if (h_game < 5) calDayNum = (calDayNum % 7) + 1;
        const tr = translateTime(timeStr);
        const userDayNum = (calDayNum + tr.dayShift - 1 + 7) % 7 + 1;
        const [h,m,s] = tr.time.split(":").map(Number);
        let eventDate = new Date(now.getTime());
        eventDate.setHours(h,m,s,0);
        let daysAhead = (userDayNum - userDayNow + 7) % 7;
        eventDate.setDate(now.getDate() + daysAhead);
        if (daysAhead === 0 && eventDate <= now) {
            eventDate.setDate(now.getDate() + 7);
        }
        if (bestFuture === null || eventDate < bestFuture) bestFuture = eventDate;
    }
    if (bestFuture) {
        const diff = bestFuture - now;
        const totalSec = Math.floor(diff / 1000);
        return { hours: Math.floor(totalSec/3600), minutes: Math.floor((totalSec%3600)/60), seconds: totalSec%60, totalSec: totalSec };
    }
    return null;
}

const phaseEvents = {
    "Понедельник": ["Улучшение бойца", "Улучшение Героя"],
    "Вторник": ["Строительство Базы", "Улучшение бойца"],
    "Среда": ["Исследования технологий"],
    "Четверг": ["Улучшение Героя"],
    "Пятница": ["Строительство Базы", "Исследования технологий", "Обучить Солдат"],
    "Суббота": ["Улучшение бойца", "Улучшение Героя", "Строительство Базы", "Обучить Солдат"],
    "Воскресенье": []
};

const allTrackedEvents = [
    { event: "Улучшение бойца", icon: "⚔️" },
    { event: "Улучшение Героя", icon: "🦸" },
    { event: "Строительство Базы", icon: "🏗️" },
    { event: "Исследования технологий", icon: "🔬" },
    { event: "Обучить Солдат", icon: "🎓" }
];

function getCurrentActiveEvent() {
    const now = getGameNow();
    const daysRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const weekday = daysRu[now.getDay()];
    let hour = now.getHours();
    if (hour < 5) return null;

    for (let i = 0; i < rawCalendar.length; i++) {
        const [dayStr, timeStr, evName] = rawCalendar[i];
        const dayNum = parseInt(dayStr.split(" ")[1]);
        const weekDayFromNum = daysRu[dayNum - 1];
        if (weekDayFromNum !== weekday) continue;

        const [hStart] = timeStr.split(':').map(Number);
        let nextIdx = i + 1;
        if (nextIdx >= rawCalendar.length || rawCalendar[nextIdx][0] !== dayStr) nextIdx = i - 5;
        const [hEnd] = rawCalendar[nextIdx] ? rawCalendar[nextIdx][1].split(':').map(Number) : [24];
        let startH = hStart;
        let endH = hEnd;
        if (endH <= startH) endH += 24;
        let curH = hour;
        if (curH < startH) curH += 24;

        if (curH >= startH && curH < endH) {
            return evName;
        }
    }
    return null;
}

function updateCurrentEventBanner() {
    const banner = document.getElementById("currentEventBanner");
    if (!banner) return;
    const activeEvent = getCurrentActiveEvent();
    const { currentPhase } = getCurrentPhaseAndNext();
    if (activeEvent && currentPhase) {
        const eventLabel = i18n[currentLang].event_labels[activeEvent] || activeEvent;
        banner.innerText = t('current_active_phase_event', { phase: currentPhase.name, event: eventLabel });
        banner.classList.add("active");
    } else if (activeEvent) {
        const eventLabel = i18n[currentLang].event_labels[activeEvent] || activeEvent;
        banner.innerText = t('current_active_event', { event: eventLabel });
        banner.classList.add("active");
    } else {
        banner.classList.remove("active");
    }
}

function updateEventTimers() {
    const container = document.getElementById("eventTimers");
    if (!container) return;
    const weekdayRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"][getGameNow().getDay()];
    const important = phaseEvents[weekdayRu] || [];
    const items = [];
    allTrackedEvents.forEach(te => {
        const timeInfo = getTimeToEvent(te.event);
        const isImportant = important.includes(te.event);
        items.push({ te, timeInfo, isImportant });
    });
    items.sort((a, b) => {
        const aSec = a.timeInfo ? a.timeInfo.totalSec : Number.MAX_SAFE_INTEGER;
        const bSec = b.timeInfo ? b.timeInfo.totalSec : Number.MAX_SAFE_INTEGER;
        return aSec - bSec;
    });
    let html = '';
    items.forEach(item => {
        const { te, timeInfo, isImportant } = item;
        const cls = isImportant ? 'event-timer-item highlight' : 'event-timer-item';
        const label = i18n[currentLang].event_labels[te.event] || te.event;
        const timeStr = timeInfo ? `${timeInfo.hours}${t('ui.st_h')} ${timeInfo.minutes}${t('ui.st_m')}` : '—';
        const vsHint = isImportant ? `<span class="vs-hint">${t('ui.vs_hint')}</span>` : '';
        html += `<div class="${cls}"><span>${te.icon} ${label}:</span> <strong>${timeStr}</strong>${vsHint}</div>`;
    });
    container.innerHTML = html;
}

function buildPhases() {
    const container = document.getElementById("phasesContainer");
    container.innerHTML = "";
    let groups = [], lastDay = "";
    for (let row of i18n[currentLang].phases_raw) {
        const day = row[0] || lastDay;
        if (row[0]) lastDay = day;
        let group = groups.find(g => g.day === day);
        if (!group) { group = { day, rows: [] }; groups.push(group); }
        group.rows.push({ phaseName: row[1], points: row[2], comment: row[3] });
    }
    const daysRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    groups.forEach(group => {
        const dayTranslated = group.day;
        const dayIdx = i18n[currentLang].days.indexOf(dayTranslated);
        const dayRu = daysRu[dayIdx] || dayTranslated;
        const card = document.createElement("div"); card.className = "phase-day-card";
        const header = document.createElement("div"); header.className = "phase-day-header";
        const daySpan = document.createElement("span"); daySpan.className = "day-name"; daySpan.innerText = dayTranslated;
        const tipsSpan = document.createElement("span"); tipsSpan.className = "day-tips";
        const dayTips = i18n[currentLang].phase_tips;
        tipsSpan.innerText = dayTips[dayRu] || "💡";
        header.appendChild(daySpan);
        header.appendChild(tipsSpan);
        const icon = document.createElement("span"); icon.className = "toggle-icon"; icon.innerText = "▼";
        header.appendChild(icon);
        header.onclick = () => {
            card.classList.toggle("open");
            icon.innerText = card.classList.contains("open") ? "▲" : "▼";
        };
        const content = document.createElement("div"); content.className = "phase-day-content";
        const phaseTitle = group.rows.find(r => r.phaseName && r.phaseName !== "")?.phaseName || "";
        if (phaseTitle) {
            const phaseNameDiv = document.createElement("div"); phaseNameDiv.className = "phase-name"; phaseNameDiv.innerText = phaseTitle;
            content.appendChild(phaseNameDiv);
        }
        group.rows.forEach(row => {
            if (!row.points && !row.comment) return;
            const evCard = document.createElement("div"); evCard.className = "event-card";
            const points = row.points;
            const comment = row.comment;
            let html = `<div class="event-points"><strong>${points || ""}</strong></div>`;
            if (comment) html += `<div class="event-comment">💡 ${comment}</div>`;
            evCard.innerHTML = html;
            content.appendChild(evCard);
        });
        card.appendChild(header); card.appendChild(content); container.appendChild(card);
    });
}

function getBonusMultiplier(phase, map) { const all = parseFloat(document.getElementById("vs_all").value) || 0; let cat = 0; if (map[phase]) cat = parseFloat(document.getElementById(map[phase]).value) || 0; return 1 + (all + cat) / 100; }
function updateScoreForPhase(phase, map, customPoints = null) {
    let total = 0;
    const mult = getBonusMultiplier(phase, map);
    const inputs = document.querySelectorAll(`.score-input[data-phase="${phase}"]`);
    inputs.forEach(inp => {
        const action = inp.dataset.action;
        let val = parseFloat(inp.value) || 0;
        let base = parseFloat(inp.dataset.base);
        if (action === "experience") val = Math.floor(val / 660);
        else if (action === "food" || action === "metal") val = Math.floor(val / 100);
        else if (action === "oil") val = Math.floor(val / 60);
        const rowTotal = val * base * mult;
        const totalCell = document.getElementById(`total_${phase}_${inp.id.split('_')[1]}`);
        if (totalCell) totalCell.innerText = Math.floor(rowTotal);
        total += rowTotal;
    });
    if (customPoints !== null) total += customPoints;
    const totalDiv = document.getElementById(`total_${phase}`);
    if (totalDiv) totalDiv.innerText = `${t('ui.total')}: ${Math.floor(total)} ${t('ui.points')}`;
    const progDiv = document.getElementById(`progress_${phase}`);
    if (progDiv) {
        let filled = Math.floor(total);
        let next = rewardThresholds.find(threshold => threshold > filled) || rewardThresholds[rewardThresholds.length-1];
        let percent = Math.min(100, (filled / next) * 100);
        progDiv.querySelector(".progress-fill").style.width = `${percent}%`;
        let marks = "";
        rewardThresholds.forEach(threshold => { if (threshold <= next) marks += `<span style="left: ${(threshold/next)*100}%;"></span>`; });
        progDiv.querySelector(".progress-marks").innerHTML = marks;
        let idx = rewardThresholds.findIndex(threshold => threshold > filled);
        if (idx !== -1) progDiv.querySelector(".progress-labels").innerHTML = `${filled.toLocaleString()} / ${rewardThresholds[idx].toLocaleString()}<br>${t('ui.next_chest')}: ${rewardThresholds[idx].toLocaleString()}`;
        else progDiv.querySelector(".progress-labels").innerHTML = `${filled.toLocaleString()} / ${t('ui.all_chests')}`;
    }
}
function buildScoreCalculator() {
    const container = document.getElementById("scoreContainer");
    container.innerHTML = "";
    const phases = i18n[currentLang].phase_names;
    const baseScore = i18n[currentLang].base_score;
    const categoryMap = { "Радар":"vs_radar","Строительство":"vs_build","Технологии":"vs_research","Герой":"vs_hire","Боеготовность":"vs_train","Рейд":"vs_kill",
                         "Radar":"vs_radar","Construction":"vs_build","Technology":"vs_research","Hero":"vs_hire","Readiness":"vs_train","Raid":"vs_kill" };
    const actionMap = { "Использовать 660 опыта Героя":"experience","Собрать 100 ед. еды":"food","Собрать 100 ед. металла":"metal","Собрать 60 ед. нефти":"oil",
                        "Use 660 Hero EXP":"experience","Gather 100 Food":"food","Gather 100 Metal":"metal","Gather 60 Oil":"oil" };
    phases.forEach((phase, i) => {
        const card = document.createElement("div"); card.className = "score-calc";
        const header = document.createElement("div"); header.className = "score-header"; header.innerHTML = `<span>🏆 ${phase}</span><span class="toggle-icon">▼</span>`;
        const content = document.createElement("div"); content.className = "score-content";
        const table = document.createElement("table"); table.className = "score-table";
        let thAction = t('ui.th_action');
        let thBase = t('ui.th_base');
        let thQty = t('ui.th_qty');
        let thTotal = t('ui.th_total');
        let tbody = `<thead><th>${thAction}</th><th>${thBase}</th><th>${thQty}</th><th>${thTotal}</th></thead><tbody>`;
        baseScore[phase].forEach((item, idx) => {
            let itemName = item[0];
            let inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="1" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="${actionMap[item[0]] || ""}">`;
            if (actionMap[item[0]] === "experience") inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="1000" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="experience" placeholder="${t('ui.k_exp')}">`;
            else if (actionMap[item[0]] === "food" || actionMap[item[0]] === "metal") inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="100" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="${actionMap[item[0]]}" placeholder="${t('ui.total_units')}">`;
            else if (actionMap[item[0]] === "oil") inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="60" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="oil" placeholder="${t('ui.total_units')}">`;
            tbody += `<tr><td>${itemName}</td><td>${item[1]}</td><td>${inputHtml}</td><td class="score-row-total" id="total_${phase}_${idx}">0</td></tr>`;
        });
        tbody += "</tbody>";
        table.innerHTML = tbody;
        const totalDiv = document.createElement("div"); totalDiv.className = "score-total"; totalDiv.id = `total_${phase}`; totalDiv.innerText = `${t('ui.total')}: 0`;
        const progDiv = document.createElement("div"); progDiv.className = "score-progress"; progDiv.id = `progress_${phase}`; progDiv.innerHTML = `<div class="progress-bar"><div class="progress-fill"></div><div class="progress-marks"></div></div><div class="progress-labels"></div>`;
        const addDiv = document.createElement("div"); addDiv.className = "add-points"; addDiv.innerHTML = `<input type="number" id="add_${phase}" placeholder="+ ${t('ui.points')}" value="0" step="1000"><button class="add-points-btn" data-phase="${phase}">${t('ui.add_points')}</button>`;
        content.appendChild(table); content.appendChild(totalDiv); content.appendChild(progDiv); content.appendChild(addDiv);
        card.appendChild(header); card.appendChild(content); container.appendChild(card);
        header.onclick = () => { card.classList.toggle("open"); const ic = header.querySelector(".toggle-icon"); ic.innerText = card.classList.contains("open") ? "▲" : "▼"; };
    });
    document.querySelectorAll(".vs-bonus").forEach(inp => inp.addEventListener("input", () => phases.forEach(p => updateScoreForPhase(p, categoryMap))));
    document.querySelectorAll(".score-input").forEach(inp => inp.addEventListener("input", () => updateScoreForPhase(inp.dataset.phase, categoryMap)));
    document.querySelectorAll(".add-points-btn").forEach(btn => btn.addEventListener("click", (e) => {
        let phase = btn.dataset.phase;
        let addVal = parseInt(document.getElementById(`add_${phase}`).value) || 0;
        if (addVal !== 0) {
            let cur = 0;
            let totalDiv = document.getElementById(`total_${phase}`);
            let match = totalDiv.innerText.match(/\d+/);
            if (match) cur = parseInt(match[0]) || 0;
            updateScoreForPhase(phase, categoryMap, cur + addVal);
            document.getElementById(`add_${phase}`).value = 0;
        }
    }));
    phases.forEach(p => updateScoreForPhase(p, categoryMap));
}

function buildUpgrades() {
    const container = document.getElementById("upgradesContainer");
    container.innerHTML = `<div class="upgrade-selector"><label for="upgradeLevelSelect">${t('ui.select_level')}</label><select id="upgradeLevelSelect">${Array.from({length:30}, (_,i) => `<option value="${i+1}">${t('ui.level')} ${i+1}</option>`).join('')}</select><div id="upgradeDetail" class="upgrade-detail">${t('ui.select_lvl_req')}</div></div>`;
    const sel = document.getElementById("upgradeLevelSelect");
    const det = document.getElementById("upgradeDetail");
    const translateBuilding = (name) => {
        if (!name || name === "—") return "—";
        let translated = name;
        const match = name.match(/^(.*) \(Ур\.(\d+)\)$/);
        if (match) {
            const ruName = match[1];
            const lvl = match[2];
            const tName = i18n[currentLang].buildings[ruName] || ruName;
            return `${tName} (${i18n[currentLang].buildings['Ур.']}${lvl})`;
        }
        return i18n[currentLang].buildings[name] || name;
    };
    sel.addEventListener("change", () => {
        let row = upgradesData[parseInt(sel.value)-1];
        det.innerHTML = row ? `<strong>${t('ui.condition')} 1:</strong> ${translateBuilding(row[1])}<br><strong>${t('ui.condition')} 2:</strong> ${translateBuilding(row[2])}` : t('ui.no_data');
    });
    sel.dispatchEvent(new Event("change"));
}

function buildCalendarGroups() {
    const container = document.getElementById("calendarGroups");
    if (!container) return;
    container.innerHTML = "";
    const calendarData = buildFixedCalendar();
    const days = i18n[currentLang].calendar_days;
    const grouped = {};
    calendarData.forEach(entry => {
        const dayKey = entry.dayNum;
        if (!grouped[dayKey]) grouped[dayKey] = [];
        grouped[dayKey].push({ time: entry.time, event: entry.event });
    });
    for (let i = 1; i <= 7; i++) {
        const events = grouped[i] || [];
        const card = document.createElement("div"); card.className = "calendar-group";
        const header = document.createElement("div"); header.className = "calendar-group-header";
        header.innerHTML = `<span>${days[i-1]}</span><span class="toggle-icon">▼</span>`;
        const content = document.createElement("div"); content.className = "calendar-group-content";
        events.forEach(ev => {
            const evDiv = document.createElement("div"); evDiv.className = "calendar-event";
            evDiv.innerHTML = `<span>${ev.time}</span><span>${ev.event}</span>`;
            content.appendChild(evDiv);
        });
        header.onclick = () => {
            card.classList.toggle("open");
            header.querySelector(".toggle-icon").innerText = card.classList.contains("open") ? "▲" : "▼";
        };
        card.appendChild(header); card.appendChild(content); container.appendChild(card);
    }
}

function buildGuides() {
    const cont = document.getElementById("guidesContainer");
    cont.innerHTML = "";
    const guides = currentLang === 'ru' ? guidesData : guidesDataEn;
    guides.forEach(g => {
        const card = document.createElement("div"); card.className = "guide-card";
        const head = document.createElement("div"); head.className = "guide-header";
        head.innerHTML = `<span>${g.title}</span><span class="toggle-icon">▼</span>`;
        const body = document.createElement("div"); body.className = "guide-content"; body.innerHTML = g.content;
        head.onclick = () => { card.classList.toggle("open"); const ic = head.querySelector(".toggle-icon"); ic.innerText = card.classList.contains("open") ? "▲" : "▼"; };
        card.appendChild(head); card.appendChild(body); cont.appendChild(card);
    });
}

function buildVideos() {
    const cont = document.getElementById("videosContainer");
    if (!cont) return;
    cont.innerHTML = "";
    const videos = i18n[currentLang].videos || [];
    videos.forEach(v => {
        const card = document.createElement("div"); card.className = "video-card";
        const head = document.createElement("div"); head.className = "video-header";
        head.innerHTML = `<span>${v.title}</span><span class="toggle-icon">▼</span>`;
        const body = document.createElement("div"); body.className = "video-content";
        const desc = document.createElement("div"); desc.className = "video-description";
        desc.innerText = v.description;
        const wrapper = document.createElement("div"); wrapper.className = "video-wrapper";
        wrapper.innerHTML = `<video controls width="100%" src="${v.src}" type="video/webm"></video>`;
        body.appendChild(desc);
        body.appendChild(wrapper);
        head.onclick = () => {
            card.classList.toggle("open");
            const icon = head.querySelector(".toggle-icon");
            icon.innerText = card.classList.contains("open") ? "▲" : "▼";
            if (card.classList.contains("open")) {
                const vid = body.querySelector("video");
                if (vid) vid.load();
            }
        };
        card.appendChild(head);
        card.appendChild(body);
        cont.appendChild(card);
    });
}

function getCurrentPhaseAndNext() {
    const now = getNow();
    const gameNow = getGameNow();
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayGameEn = daysEn[gameNow.getDay()];
    const phaseKeys = { "Monday": "phase_radar", "Tuesday": "phase_build", "Wednesday": "phase_tech", "Thursday": "phase_hero", "Friday": "phase_prepare", "Saturday": "phase_raid" };
    let current = null, next = null;
    const tr = translateTime("05:00:00");
    if (phaseKeys[currentDayGameEn]) {
        current = { name: t(phaseKeys[currentDayGameEn]) };
    }
    const idx = gameNow.getDay();
    for (let i = 1; i <= 7; i++) {
        let ndEn = daysEn[(idx + i) % 7];
        if (phaseKeys[ndEn]) {
            let st = new Date(now.getTime());
            st.setDate(now.getDate() + i + tr.dayShift);
            const [h,m,s] = tr.time.split(":").map(Number);
            st.setHours(h, m, s, 0);
            next = { name: t(phaseKeys[ndEn]), start: st };
            break;
        }
    }
    return { currentPhase: current, nextPhase: next };
}

function getNextCalendarEvent() {
    const now = getNow();
    const userDayNow = {0:1,1:2,2:3,3:4,4:5,5:6,6:7}[now.getDay()];
    let best = Infinity, bestEv = null;
    for (let i = 0; i < rawCalendar.length; i++) {
        const [dayStr, timeStr, evName] = rawCalendar[i];
        const dayNum = parseInt(dayStr.split(" ")[1]);
        const [h_game] = timeStr.split(':').map(Number);
        let calDayNum = dayNum;
        if (h_game < 5) calDayNum = (calDayNum % 7) + 1;
        const tr = translateTime(timeStr);
        const userDayNum = (calDayNum + tr.dayShift - 1 + 7) % 7 + 1;
        const [h,m,s] = tr.time.split(":").map(Number);
        let dt = new Date(now.getTime());
        dt.setHours(h,m,s,0);
        let ahead = (userDayNum - userDayNow + 7) % 7;
        dt.setDate(now.getDate() + ahead);
        if (ahead === 0 && dt <= now) dt.setDate(dt.getDate() + 7);
        let diff = dt - now;
        if (diff > 0 && diff < best) {
            best = diff;
            bestEv = { name: evName, delta: diff };
        }
    }
    if (bestEv) {
        let ts = Math.floor(bestEv.delta/1000);
        return { name: bestEv.name, hours: Math.floor(ts/3600), minutes: Math.floor((ts%3600)/60), seconds: ts%60 };
    }
    return null;
}

function updateTimeDisplay() {
    const now = getNow();
    const serverNow = getServerNow();
    document.getElementById("localTime").innerText = now.toLocaleTimeString(currentLang === 'ru' ? "ru-RU" : "en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("serverTime").innerText = serverNow.toLocaleTimeString(currentLang === 'ru' ? "ru-RU" : "en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("gameDay").innerText = getGameDayCorrected();
    document.getElementById("weekdayName").innerText = getWeekdayName();
    let { currentPhase, nextPhase } = getCurrentPhaseAndNext();
    let html = "";
    if (currentPhase) html += `${t('ui.current_phase')}: ${currentPhase.name}<br>`;
    if (nextPhase) {
        let rem = Math.max(0, Math.floor((nextPhase.start - now) / 1000));
        html += `${t('ui.next_phase_rem')}: ${formatTime(rem)}`;
    }
    else html += t('ui.no_next_phase');
    document.getElementById("phaseInfo").innerHTML = html;
    let nxt = getNextCalendarEvent();
    if (nxt) {
        document.getElementById("nextEvent").innerHTML = t('next_event', { event: translateEvent(nxt.name), h: nxt.hours, m: nxt.minutes });
    } else {
        document.getElementById("nextEvent").innerHTML = t('no_next_event');
    }
}

function updateReminder() {
    const day = getWeekdayName();
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    let idx = daysEn.indexOf(day);
    if (idx === -1) idx = daysRu.indexOf(day);
    const dayKey = daysEn[idx];
    const tips = i18n[currentLang].tips;
    let list = tips[dayKey] || (currentLang === 'ru' ? ["📅 Следуйте расписанию фаз."] : ["📅 Follow the phase schedule."]);
    const dayTranslated = i18n[currentLang].days[idx] || day;
    document.getElementById("reminder").innerHTML = `<strong>📌 ${t('ui.reminders')} ${dayTranslated}</strong><ul>${list.map(tip=>`<li>${tip}</li>`).join('')}</ul>`;
}

let items = [], selectedIdx = -1;
function getStartSec() { return (parseInt(document.getElementById("startDays").value)||0)*86400+(parseInt(document.getElementById("startHours").value)||0)*3600+(parseInt(document.getElementById("startMinutes").value)||0)*60+(parseInt(document.getElementById("startSeconds").value)||0); }
function updateResult() {
    let total = items.reduce((s,i)=>s+i.quantity*i.durationMinutes*60,0);
    let start = getStartSec(), mode = document.querySelector('input[name="mode"]:checked').value;
    let end = mode==="add"?start+total:start-total; if(end<0) end=0;
    document.getElementById("resultTime").innerText = formatTime(end);
}
function renderItems() {
    const ul = document.getElementById("itemsList"); ul.innerHTML="";
    items.forEach((it,i)=>{
        let txt;
        const durationsRu = {1:"1 минута",5:"5 минут",60:"1 час",240:"4 часа",480:"8 часов"};
        const durationsEn = {1:"1 minute",5:"5 minutes",60:"1 hour",240:"4 hours",480:"8 hours"};
        txt = currentLang === 'ru' ? durationsRu[it.durationMinutes] : durationsEn[it.durationMinutes];
        const li=document.createElement("li");
        li.innerText=`${it.quantity} ${t('ui.pcs')} × ${txt}`;
        li.onclick=()=>{ document.querySelectorAll("#itemsList li").forEach(l=>l.classList.remove("selected")); li.classList.add("selected"); selectedIdx=i; }; ul.appendChild(li);
    });
}
function addItem() { let q=parseInt(document.getElementById("itemQty").value), d=parseInt(document.getElementById("durationSelect").value); if(q>0){ items.push({quantity:q,durationMinutes:d}); renderItems(); updateResult(); } else alert(t('ui.item_qty_err')); }
function editItem() { if(selectedIdx!==-1){ let it=items[selectedIdx]; document.getElementById("itemQty").value=it.quantity; document.getElementById("durationSelect").value=it.durationMinutes; items.splice(selectedIdx,1); selectedIdx=-1; renderItems(); updateResult(); } else alert(t('ui.select_item_err')); }
function delItem() { if(selectedIdx!==-1){ items.splice(selectedIdx,1); selectedIdx=-1; renderItems(); updateResult(); } else alert(t('ui.select_item_err')); }
function resetAll() { items=[]; selectedIdx=-1; renderItems(); document.getElementById("startDays").value=0; document.getElementById("startHours").value=0; document.getElementById("startMinutes").value=0; document.getElementById("startSeconds").value=0; updateResult(); }
function convertComponent() {
    let from = document.getElementById("convFrom").value;
    let to = document.getElementById("convTo").value;
    let amount = parseFloat(document.getElementById("convertAmount").value) || 0;
    let result = 0;
    const rates = { steel:1, steelComp:4, heatGold:16, composite:64, crystal:256 };
    let fromVal = rates[from];
    let toVal = rates[to];
    if (fromVal && toVal) result = amount * fromVal / toVal;
    const resName = i18n[currentLang].ui.res_names[to] || to;
    document.getElementById("convertResult").innerHTML = `${Math.floor(result)} ${resName}`;
}
function calcGearUpgrade() {
    let cur = parseInt(document.getElementById("gearCur").value) || 0;
    let tar = parseInt(document.getElementById("gearTar").value) || 0;
    if (cur>=tar) { alert(t('ui.gear_lvl_err')); return; }
    let totalStone = 0, totalOil = 0;
    for (let i=cur; i<tar; i++) {
        let cost = gearUpgradeCost.find(c => c.from === i);
        if (cost) { totalStone += cost.stone; totalOil += cost.oil; }
        else { alert(`${t('ui.no_gear_data')} ${i}→${i+1}`); return; }
    }
    document.getElementById("gearResult").innerHTML = `${t('ui.stones')}: ${totalStone}<br>${t('ui.oil')}: ${totalOil.toLocaleString()}`;
}
function calcStarCost() {
    let star = document.querySelector('input[name="starType"]:checked').value;
    let stone, crystals, oil;
    if (star === "star1") { stone = 12000 * 5; crystals = 145 * 5; oil = 20000000 * 5; }
    else { stone = 16000 * 5; crystals = 200 * 5; oil = 30000000 * 5; }
    document.getElementById("starResult").innerHTML = `${t('ui.stones')}: ${stone}<br>${t('ui.crystals')}: ${crystals}<br>${t('ui.oil')}: ${oil.toLocaleString()}`;
}

function buildCodes() {
    const container = document.getElementById("codesContainer");
    if (!container) return;
    const codes = ["ZRR2026","ZRR6666","ZRR999","DC4KFBG","VK10KYUT","VK12KDGH","DC6KFEO","VK15KOKL","DC8KYHJ","VK20KDSM","DC10KSDF","VK35KYGD"];
    container.innerHTML = "";
    codes.forEach(code => {
        const card = document.createElement("div");
        card.className = "code-card";
        card.innerText = code;
        card.title = t('ui.copy_code');
        card.addEventListener("click", () => {
            navigator.clipboard.writeText(code).then(() => {
                const prev = card.innerText;
                card.innerText = t('ui.copied');
                card.classList.add("copied-flash");
                setTimeout(() => {
                    card.innerText = prev;
                    card.classList.remove("copied-flash");
                }, 1500);
            });
        });
        container.appendChild(card);
    });
}

function updateLanguage() {
    localStorage.setItem('lang', currentLang);
    document.documentElement.lang = currentLang;
    const langBtn = document.getElementById("langToggle");
    if (langBtn) langBtn.innerText = t('lang_name');
    const mainTitleSub = document.getElementById("mainTitleSub");
    if (mainTitleSub) mainTitleSub.innerHTML = t('ui.main_subtitle');
    document.getElementById("localTimeLabel").innerText = i18n[currentLang].local_time;
    document.getElementById("serverTimeLabel").innerText = i18n[currentLang].server_time;
    document.getElementById("gameDayLabel").innerText = i18n[currentLang].game_day;
    document.getElementById("tzLabel").innerText = i18n[currentLang].timezone;
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
        const isDark = document.body.classList.contains('dark');
        themeBtn.innerText = isDark ? t('theme_light') : t('theme_dark');
    }
    document.querySelectorAll(".tab-button").forEach(btn => {
        const tab = btn.dataset.tab;
        if (i18n[currentLang].tabs[tab]) btn.innerText = i18n[currentLang].tabs[tab];
    });
    document.getElementById("vsTitle").innerText = t('ui.vs_title');
    document.getElementById("vsBonusNote").innerText = t('ui.vs_bonus_note');
    document.getElementById("itemsListHeader").innerText = t('ui.items_header');
    document.getElementById("convChainDesc").innerText = t('ui.conv_chain_desc');
    document.getElementById("star1Label").childNodes[2].textContent = t('ui.star1_label');
    document.getElementById("star2Label").childNodes[2].textContent = t('ui.star2_label');

    buildPhases();
    buildScoreCalculator();
    buildUpgrades();
    buildCalendarGroups();
    buildGuides();
    buildCodes();
    buildVideos();
    updateReminder();
    updateEventTimers();
    updateCurrentEventBanner();
    updateTimeDisplay();
    updateResult();
    const bonusLabels = i18n[currentLang].ui.bonus_labels;
    for (let id in bonusLabels) {
        const el = document.getElementById(id);
        if (el && el.previousElementSibling) el.previousElementSibling.innerText = bonusLabels[id];
    }
    const calcHeader = document.querySelector("#toggleCalculator h2");
    if (calcHeader) calcHeader.innerText = t('ui.calc_time');
    const resHeader = document.querySelector("#tab-resources h3");
    if (resHeader) resHeader.innerText = t('ui.conv_title');
    const gearHeader = document.querySelector("#tab-itemupgrade h3:nth-of-type(1)");
    if (gearHeader) gearHeader.innerText = t('ui.gear_title');
    const starHeader = document.querySelector("#tab-itemupgrade h3:nth-of-type(2)");
    if (starHeader) starHeader.innerText = t('ui.stars_title');
    const resourceNames = i18n[currentLang].ui.resources;
    document.querySelectorAll("#convFrom option, #convTo option").forEach(opt => {
        opt.innerText = resourceNames[opt.value] || opt.innerText;
    });
    document.getElementById("resetStartBtn").innerText = t('ui.reset');
    document.getElementById("resetAllBtn").innerText = t('ui.reset_all');
    document.getElementById("convertBtn").innerText = t('ui.calculate');
    document.getElementById("calcGearUpgrade").innerText = t('ui.calculate');
    document.getElementById("calcStarCost").innerText = t('ui.calc_star');
    const supportCard = document.getElementById("supportCard");
    if (supportCard) supportCard.innerHTML = t('ui.support_html');
}

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const langToggle = document.getElementById("langToggle");
    const tzSelect = document.getElementById("tzSelect");
    for (let i = -12; i <= 14; i++) {
        const opt = document.createElement("option");
        const val = (i >= 0 ? "+" : "") + i;
        opt.value = i;
        opt.innerText = `UTC ${val}`;
        if (parseFloat(currentTZ) === i) opt.selected = true;
        tzSelect.appendChild(opt);
    }
    tzSelect.onchange = () => {
        currentTZ = tzSelect.value;
        localStorage.setItem('tz', currentTZ);
        updateLanguage();
    };
    langToggle.onclick = () => {
        currentLang = currentLang === 'ru' ? 'en' : 'ru';
        updateLanguage();
    };
    themeToggle.onclick = () => {
        const isDark = document.body.classList.toggle("dark");
        themeToggle.innerText = isDark ? t('theme_light') : t('theme_dark');
    };
    updateLanguage();
    setInterval(() => { updateTimeDisplay(); updateEventTimers(); updateCurrentEventBanner(); updateReminder(); }, 1000);
    document.getElementById("collapseTimeBtn").addEventListener("click", () => document.getElementById("timePanel").classList.toggle("collapsed"));
    const calcBody = document.getElementById("calcBody"), calcIcon = document.getElementById("calcToggleIcon");
    let calcCollapsed = false;
    document.getElementById("toggleCalculator").addEventListener("click", () => {
        if(calcCollapsed){ calcBody.style.maxHeight=calcBody.scrollHeight+"px"; calcIcon.innerText="▼"; setTimeout(()=>calcBody.style.maxHeight="none",300); }
        else{ calcBody.style.maxHeight=calcBody.scrollHeight+"px"; setTimeout(()=>calcBody.style.maxHeight="0",10); calcIcon.innerText="▲"; }
        calcCollapsed=!calcCollapsed;
    });
    calcBody.style.maxHeight="none";
    document.getElementById("addItemBtn").onclick=addItem;
    document.getElementById("editItemBtn").onclick=editItem;
    document.getElementById("delItemBtn").onclick=delItem;
    document.getElementById("resetAllBtn").onclick=resetAll;
    document.getElementById("resetStartBtn").onclick=()=>{
        document.getElementById("startDays").value=0;
        document.getElementById("startHours").value=0;
        document.getElementById("startMinutes").value=0;
        document.getElementById("startSeconds").value=0;
        updateResult();
    };
    document.querySelectorAll("#startDays, #startHours, #startMinutes, #startSeconds").forEach(e=>e.addEventListener("input",updateResult));
    document.querySelectorAll('input[name="mode"]').forEach(r=>r.addEventListener("change",updateResult));
    document.getElementById("convertBtn").onclick = convertComponent;
    document.getElementById("calcGearUpgrade").onclick = calcGearUpgrade;
    document.getElementById("calcStarCost").onclick = calcStarCost;
    const tabBtns = document.querySelectorAll(".tab-button"), tabs = document.querySelectorAll(".tab-content");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            let tab=btn.dataset.tab;
            tabBtns.forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            tabs.forEach(tab=>tab.classList.remove("active"));
            document.getElementById(`tab-${tab}`).classList.add("active");
        });
    });
});
