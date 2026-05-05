document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => { if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'c' || e.key === 'i' || e.key === 'j')) e.preventDefault(); });

const rawCalendar = [
    ["День 1","09:00:00","Строительство Базы"],["День 1","13:00:00","Обучить Солдат"],["День 1","17:00:00","Исследования технологий"],["День 1","21:00:00","Улучшение бойца"],["День 1","01:00:00","Улучшение Героя"],["День 1","05:00:00","Строительство Базы"],
    ["День 2","09:00:00","Улучшение Героя"],["День 2","13:00:00","Строительство Базы"],["День 2","17:00:00","Обучить Солдат"],["День 2","21:00:00","Улучшение бойца"],["День 2","01:00:00","Улучшение бойца"],["День 2","05:00:00","Улучшение Героя"],
    ["День 3","09:00:00","Строительство Базы"],["День 3","13:00:00","Обучить Солдат"],["День 3","17:00:00","Исследования технологий"],["День 3","21:00:00","Улучшение бойца"],["День 3","01:00:00","Улучшение Героя"],["День 3","05:00:00","Строительство Базы"],
    ["День 4","09:00:00","Строительство Базы"],["День 4","13:00:00","Исследования технологий"],["День 4","17:00:00","Улучшение бойца"],["День 4","21:00:00","Улучшение Героя"],["День 4","01:00:00","Строительство Базы"],["День 4","05:00:00","Обучить Солдат"],
    ["День 5","09:00:00","Исследования технологий"],["День 5","13:00:00","Улучшение бойца"],["День 5","17:00:00","Улучшение Героя"],["День 5","21:00:00","Строительство Базы"],["День 5","01:00:00","Обучить Солдат"],["День 5","05:00:00","Исследования технологий"],
    ["День 6","09:00:00","Улучшение бойца"],["День 6","13:00:00","Улучшение Героя"],["День 6","17:00:00","Строительство Базы"],["День 6","21:00:00","Обучить Солдат"],["День 6","01:00:00","Исследования технологий"],["День 6","05:00:00","Улучшение бойца"],
    ["День 7","09:00:00","Улучшение Героя"],["День 7","13:00:00","Строительство Базы"],["День 7","17:00:00","Обучить Солдат"],["День 7","21:00:00","Исследования технологий"],["День 7","01:00:00","Улучшение бойца"],["День 7","05:00:00","Улучшение Героя"]
];

function buildFixedCalendar() {
    const days = [[], [], [], [], [], [], []];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
            const idx = i * 6 + j;
            days[i].push(rawCalendar[idx][2]);
        }
    }
    const newData = [];
    for (let i = 0; i < 7; i++) {
        const cur = i + 1;
        for (let j = 0; j < 4; j++) {
            newData.push([`День ${cur}`, rawCalendar[i*6+j][1], days[i][j]]);
        }
        const prev = i === 0 ? 6 : i - 1;
        newData.push([`День ${cur}`, "01:00:00", days[prev][4]]);
        newData.push([`День ${cur}`, "05:00:00", days[prev][5]]);
    }
    return newData;
}

const calendarData = buildFixedCalendar();

const phasesRaw = [
    ["Воскресенье", "", "События радара (Копим на завтра)", "Отправляем в ночь отряды на сбор ресурсов."],
    ["Понедельник", "Фаза 1. Радар", "Завершить событие Радара", "Сразу выполняйте накопленные задания радара."],
    ["", "", "Использовать 1 Часть бойца", "Используйте части бойцов."],
    ["", "", "Использовать 1 Боевой чип бойца", "Используйте боевые чипы."],
    ["", "", "Потратить 1 Выносливость", "Тратьте выносливость на задания радара."],
    ["", "", "Использовать 660 опыта Героя", "Приберечь для фазы героя."],
    ["", "", "Сбор 100 ед. ресурсов", "Как только отряды вернулись — сразу отправляйте их снова на сбор."],
    ["Вторник", "Фаза 2. Строительство", "Использовать 1 минуту ускорения постройки", "Завершите заранее начатые стройки."],
    ["", "", "Завершить постройку за +1 Мощь", "Используйте ускорения постройки."],
    ["", "", "Выполнить 1 оранжевую миссию", "Используйте жетоны для поиска."],
    ["", "", "Отправить 1 Легендарный Транспортник", "Используйте контракты конвоя."],
    ["", "", "", "События радара (Копим на завтра)."],
    ["Среда", "Фаза 3. Технологии", "Завершить событие Радара", "Закройте все доступные события радара."],
    ["", "", "Использовать 1 минуту ускорения исследования", "Используйте ускорения исследований."],
    ["", "", "Завершить исследование за +1 Силу", "Завершайте самые долгие технологии."],
    ["", "", "Потратить 1 Научные данные", "Тратьте научные данные."],
    ["", "", "Открыть сундук с компонентами бойца", "Откройте все накопленные сундуки."],
    ["Четверг", "Фаза 4. Герой", "Использовать 660 опыта Героя", "Используйте опыт героя."],
    ["", "", "Использовать карту найма героя", "Используйте карты найма первыми."],
    ["", "", "Фрагмент героя или универс. (Мифический)", "Тратьте мифические фрагменты."],
    ["", "", "Фрагмент героя или универс. (Эпический)", "Тратьте эпические фрагменты."],
    ["", "", "Фрагмент героя или универс. (Редкий)", "Тратьте редкие фрагменты."],
    ["", "", "Использовать книгу навыков", "Примените книги навыков."],
    ["", "", "", "События радара (Копим на завтра)."],
    ["Пятница", "Фаза 5. Боеготовность", "Завершить событие Радара", "Закройте радар."],
    ["", "", "Использовать 1 минуту ускорения постройки", "Используйте ускорения постройки."],
    ["", "", "Завершить постройку за +1 Мощь", "Завершайте стройки."],
    ["", "", "Использовать 1 минуту ускорения исследования", "Используйте ускорения исследований."],
    ["", "", "Завершить исследование за +1 Силу", "Завершайте исследования."],
    ["", "", "Использовать 1 минуту ускорения тренировок", "Используйте ускорения тренировок."],
    ["", "", "Обучить солдат", "Начинайте обучение солдат (очки сразу)."],
    ["Суббота", "Фаза 6. Рейд", "Использовать 1 минуту ускорения постройки", "Используйте оставшиеся ускорения постройки."],
    ["", "", "Использовать 1 минуту ускорения исследования", "Используйте оставшиеся ускорения исследований."],
    ["", "", "Использовать 1 минуту ускорения тренировок", "Используйте оставшиеся ускорения тренировок."],
    ["", "", "Использовать 1 минуту ускорения лечения", "Используйте ускорения лечения."],
    ["", "", "Убийство солдат противника", "Атакуйте базы, убивайте солдат."],
    ["", "", "Смерть своих солдат", "Не бойтесь потерь — они дают очки."]
];

const upgradesData = [
    [1,"—","—"],[2,"Полигон (Ур.1)","Парковка (Ур.1)"],[3,"Линия обороны (Ур.2)","—"],[4,"Тренировочный лагерь солдат (Ур.3)","Полигон (Ур.3)"],[5,"Линия обороны (Ур.4)","Тренировочный лагерь солдат (Ур.4)"],[6,"Линия обороны (Ур.5)","Полигон (Ур.5)"],[7,"Линия обороны (Ур.6)","Центр подготовки (по классу) (Ур.6)"],[8,"Отдел альфа-исследований (Ур.7)","Центр альянса (Ур.7)"],[9,"Отдел альфа-исследований (Ур.8)","Центр подготовки (по классу) (Ур.8)"],[10,"Отдел альфа-исследований (Ур.9)","Госпиталь (Ур.9)"],[11,"Отдел альфа-исследований (Ур.10)","Линия обороны (Ур.10)"],[12,"Отдел альфа-исследований (Ур.11)","Тренировочный лагерь солдат (Ур.11)"],[13,"Отдел альфа-исследований (Ур.12)","Центр подготовки (по классу) (Ур.12)"],[14,"Отдел альфа-исследований (Ур.13)","Полигон (Ур.13)"],[15,"Отдел альфа-исследований (Ур.14)","Линия обороны (Ур.14)"],[16,"Отдел альфа-исследований (Ур.15)","Центр альянса (Ур.15)"],[17,"Отдел альфа-исследований (Ур.16)","Центр подготовки (по классу) (Ур.16)"],[18,"Отдел альфа-исследований (Ур.17)","Госпиталь (Ур.17)"],[19,"Отдел альфа-исследований (Ур.18)","Линия обороны (Ур.18)"],[20,"Отдел альфа-исследований (Ур.19)","Тренировочный лагерь солдат (Ур.19)"],[21,"Отдел альфа-исследований (Ур.20)","Центр подготовки (по классу) (Ур.20)"],[22,"Отдел альфа-исследований (Ур.21)","Полигон (Ур.21)"],[23,"Отдел альфа-исследований (Ур.22)","Линия обороны (Ур.22)"],[24,"Отдел альфа-исследований (Ур.23)","Центр альянса (Ур.23)"],[25,"Отдел альфа-исследований (Ур.24)","Центр подготовки (по классу) (Ур.24)"],[26,"Отдел альфа-исследований (Ур.25)","Госпиталь (Ур.25)"],[27,"Отдел альфа-исследований (Ур.26)","Линия обороны (Ур.26)"],[28,"Отдел альфа-исследований (Ур.27)","Тренировочный лагерь солдат (Ур.27)"],[29,"Отдел альфа-исследований (Ур.28)","Центр подготовки (по классу) (Ур.28)"],[30,"Отдел альфа-исследований (Ур.29)","Полигон (Ур.29)"]
];

const rewardThresholds = [38000, 145000, 550000, 650000, 1020000, 2280000, 2630000, 3620000, 7190000];
const gearUpgradeCost = [
    { from:0, to:1, stone:1000, oil:220000 },{ from:1, to:2, stone:1000, oil:220000 },{ from:2, to:3, stone:2000, oil:220000 },
    { from:3, to:4, stone:2000, oil:220000 },{ from:4, to:5, stone:2500, oil:330000 },{ from:5, to:6, stone:2500, oil:330000 },
    { from:6, to:7, stone:2500, oil:330000 },{ from:7, to:8, stone:2500, oil:330000 },{ from:8, to:9, stone:3000, oil:440000 },
    { from:9, to:10, stone:3000, oil:440000 },{ from:10, to:11, stone:3000, oil:440000 },{ from:11, to:12, stone:3000, oil:440000 },
    { from:12, to:13, stone:3500, oil:550000 },{ from:13, to:14, stone:3500, oil:550000 },{ from:14, to:15, stone:3500, oil:550000 },
    { from:15, to:16, stone:3500, oil:550000 },{ from:16, to:17, stone:4500, oil:660000 },{ from:17, to:18, stone:4500, oil:660000 },
    { from:18, to:19, stone:4500, oil:660000 },{ from:19, to:20, stone:4500, oil:660000 },{ from:20, to:21, stone:5000, oil:770000 },
    { from:21, to:22, stone:5000, oil:770000 },{ from:22, to:23, stone:5000, oil:770000 },{ from:23, to:24, stone:5000, oil:770000 },
    { from:24, to:25, stone:6000, oil:880000 },{ from:25, to:26, stone:6000, oil:880000 },{ from:26, to:27, stone:6000, oil:880000 },
    { from:27, to:28, stone:6000, oil:880000 },{ from:28, to:29, stone:7000, oil:990000 },{ from:29, to:30, stone:7000, oil:990000 },
    { from:30, to:31, stone:7000, oil:990000 },{ from:31, to:32, stone:7000, oil:990000 },{ from:32, to:33, stone:7500, oil:1100000 },
    { from:33, to:34, stone:7500, oil:1100000 },{ from:34, to:35, stone:7500, oil:1100000 },{ from:35, to:36, stone:7500, oil:1100000 },
    { from:36, to:37, stone:8000, oil:1200000 },{ from:37, to:38, stone:8000, oil:1200000 },{ from:38, to:39, stone:8500, oil:1300000 },
    { from:39, to:40, stone:8500, oil:1300000 }
];

function getGameDayCorrected() {
    const now = new Date();
    let d = now.getDay();
    if (now.getHours() < 5) d = (d + 6) % 7;
    return {0:1,1:2,2:3,3:4,4:5,5:6,6:7}[d];
}
function getWeekdayName() {
    const now = new Date();
    let d = now.getDay();
    if (now.getHours() < 5) d = (d + 6) % 7;
    return ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"][d];
}
function formatTime(seconds) { if (seconds<0) seconds=0; const d=Math.floor(seconds/86400); seconds%=86400; const h=Math.floor(seconds/3600); seconds%=3600; const m=Math.floor(seconds/60); const s=seconds%60; return `${d} дн ${h} ч ${m} мин ${s} сек`; }

function getTimeToEvent(eventName) {
    const now = new Date();
    let bestFuture = null;
    const currentGameDay = getGameDayCorrected();
    for (let [dayStr, timeStr, evName] of calendarData) {
        if (evName !== eventName) continue;
        const dayNum = parseInt(dayStr.split(" ")[1]);
        const [h,m,s] = timeStr.split(":").map(Number);
        let eventDate = new Date(now);
        eventDate.setHours(h,m,s,0);
        let daysAhead = (dayNum - currentGameDay + 7) % 7;
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
    { event: "Улучшение бойца", label: "Боец", icon: "⚔️" },
    { event: "Улучшение Героя", label: "Герой", icon: "🦸" },
    { event: "Строительство Базы", label: "Стройка", icon: "🏗️" },
    { event: "Исследования технологий", label: "Наука", icon: "🔬" },
    { event: "Обучить Солдат", label: "Тренировка", icon: "🎓" }
];

function updateEventTimers() {
    const container = document.getElementById("eventTimers");
    if (!container) return;
    const weekday = getWeekdayName();
    const important = phaseEvents[weekday] || [];
    let html = '';
    allTrackedEvents.forEach(te => {
        const t = getTimeToEvent(te.event);
        const isImportant = important.includes(te.event);
        const cls = isImportant ? 'event-timer-item highlight' : 'event-timer-item';
        const timeStr = t ? `${t.hours}ч ${t.minutes}м ${t.seconds}с` : '—';
        html += `<div class="${cls}"><span>${te.icon} ${te.label}:</span> <strong>${timeStr}</strong></div>`;
    });
    container.innerHTML = html;
}

function buildPhases() {
    const container = document.getElementById("phasesContainer");
    container.innerHTML = "";
    let groups = [], lastDay = "";
    for (let row of phasesRaw) {
        const day = row[0] || lastDay;
        if (row[0]) lastDay = day;
        let group = groups.find(g => g.day === day);
        if (!group) { group = { day, rows: [] }; groups.push(group); }
        group.rows.push({ phaseName: row[1], points: row[2], comment: row[3] });
    }
    groups.forEach(group => {
        let phaseTitle = "";
        for (let r of group.rows) if (r.phaseName && r.phaseName !== "") { phaseTitle = r.phaseName; break; }
        const card = document.createElement("div"); card.className = "phase-day-card";
        const header = document.createElement("div"); header.className = "phase-day-header";
        const daySpan = document.createElement("span"); daySpan.className = "day-name"; daySpan.innerText = group.day;
        const tipsSpan = document.createElement("span"); tipsSpan.className = "day-tips";
        if (group.day === "Воскресенье") tipsSpan.innerText = "📡 Копим радар";
        else if (group.day === "Понедельник") tipsSpan.innerText = "🎯 Радар + сбор";
        else if (group.day === "Вторник") tipsSpan.innerText = "🏗️ Стройка";
        else if (group.day === "Среда") tipsSpan.innerText = "🔬 Технологии";
        else if (group.day === "Четверг") tipsSpan.innerText = "🦸 Герои";
        else if (group.day === "Пятница") tipsSpan.innerText = "⚔️ Боеготовность";
        else if (group.day === "Суббота") tipsSpan.innerText = "🏆 Рейд";
        else tipsSpan.innerText = "💡";
        header.appendChild(daySpan);
        header.appendChild(tipsSpan);
        const icon = document.createElement("span"); icon.className = "toggle-icon"; icon.innerText = "▼";
        header.appendChild(icon);
        header.onclick = () => {
            card.classList.toggle("open");
            icon.innerText = card.classList.contains("open") ? "▲" : "▼";
        };
        const content = document.createElement("div"); content.className = "phase-day-content";
        if (phaseTitle) {
            const phaseNameDiv = document.createElement("div"); phaseNameDiv.className = "phase-name"; phaseNameDiv.innerText = phaseTitle;
            content.appendChild(phaseNameDiv);
        }
        group.rows.forEach(row => {
            if (!row.points && !row.comment) return;
            const evCard = document.createElement("div"); evCard.className = "event-card";
            let html = `<div class="event-points"><strong>${row.points || ""}</strong></div>`;
            if (row.comment) html += `<div class="event-comment">💡 ${row.comment}</div>`;
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
    if (totalDiv) totalDiv.innerText = `Итого: ${Math.floor(total)} очков`;
    const progDiv = document.getElementById(`progress_${phase}`);
    if (progDiv) {
        let filled = Math.floor(total);
        let next = rewardThresholds.find(t => t > filled) || rewardThresholds[rewardThresholds.length-1];
        let percent = Math.min(100, (filled / next) * 100);
        progDiv.querySelector(".progress-fill").style.width = `${percent}%`;
        let marks = "";
        rewardThresholds.forEach(t => { if (t <= next) marks += `<span style="left: ${(t/next)*100}%;"></span>`; });
        progDiv.querySelector(".progress-marks").innerHTML = marks;
        let idx = rewardThresholds.findIndex(t => t > filled);
        if (idx !== -1) progDiv.querySelector(".progress-labels").innerHTML = `${filled.toLocaleString()} / ${rewardThresholds[idx].toLocaleString()}<br>Следующий сундук: ${rewardThresholds[idx].toLocaleString()}`;
        else progDiv.querySelector(".progress-labels").innerHTML = `${filled.toLocaleString()} / Все сундуки получены!`;
    }
}
function buildScoreCalculator() {
    const container = document.getElementById("scoreContainer");
    container.innerHTML = "";
    const phases = ["Радар", "Строительство", "Технологии", "Герой", "Боеготовность", "Рейд"];
    const categoryMap = { "Радар":"vs_radar","Строительство":"vs_build","Технологии":"vs_research","Герой":"vs_hire","Боеготовность":"vs_train","Рейд":"vs_kill" };
    const actionMap = { "Использовать 660 опыта Героя":"experience","Собрать 100 ед. еды":"food","Собрать 100 ед. металла":"metal","Собрать 60 ед. нефти":"oil" };
    const baseScore = {
        "Радар":[["Потратить 1 Выносливость",150],["Выполнить задание Радара",10000],["Использовать 660 опыта Героя",1],["Набор с алмазами [1 алмаз]",30],["Собрать 100 ед. еды",20],["Собрать 100 ед. металла",20],["Собрать 60 ед. нефти",20],["Использовать 1 Боевой чип бойца",3],["Использовать 1 Часть бойца",2500]],
        "Строительство":[["Набор с алмазами [1 алмаз]",30],["За каждую минуту ускорения постройки",60],["За каждую постройку +1 Мощь",10],["Выполнить 1 оранжевую миссию Спецопераций",75000],["Отправить 1 Легендарный Транспортник",100000],["Провести 1 призыв выжившего",1500]],
        "Технологии":[["Завершить событие Радара",10000],["Использовать 1 минуту ускорения исследования",60],["Завершить исследование за +1 Силу",10],["Потратить 1 Научные данные",100],["Открыть сундук с компонентами бойца",500]],
        "Герой":[["Использовать 660 опыта Героя",1],["Набор с алмазами [1 алмаз]",30],["Нанять героя 1 раз",1500],["Использовать 1 Мифический Осколок Героя",10000],["Использовать 1 Эпический Осколок Героя",3500],["Использовать 1 Редкий Осколок Героя",1000],["Использовать 1 Книгу опыта навыков",10]],
        "Боеготовность":[["Выполнить задание Радара",10000],["Набор с алмазами [1 алмаз]",30],["За каждую минуту ускорения постройки",60],["За каждую постройку +1 Мощь",10],["За каждую минуту ускорения исследований",60],["За каждое исследование +1 Сила",10],["Ускорение тренировок (1 мин.)",60],["Обучить Т1 Солдата",20],["Обучить Т2 Солдата",30],["Обучить Солдата Т3",40],["Обучить Солдата Т4",50],["Обучить Солдата Т5",60],["Обучить Солдата Т6",70],["Обучить Солдата Т7",80],["Облучить Солдата Т8",90]],
        "Рейд":[["За каждого уничтоженного бойца T7",18],["За каждого уничтоженного солдата T8",20],["За каждого уничтоженного солдата T9",23],["За каждого уничтоженного солдата T10",25],["За каждого потерянного солдата T1",4],["За каждого потерянного солдата T2",6],["За каждого потерянного солдата T3",8],["За каждого погибшего солдата T4",10],["За каждого погибшего солдата T5",12],["За каждого погибшего солдата T6",14],["За каждого погибшего солдата T7",16],["За каждого погибшего солдата T8",18],["За каждого погибшего солдата T9",20],["За каждого потерянного бойца T10",22],["Отправить 1 Легендарный Транспортник",200000]]
    };
    phases.forEach(phase => {
        const card = document.createElement("div"); card.className = "score-calc";
        const header = document.createElement("div"); header.className = "score-header"; header.innerHTML = `<span>🏆 ${phase}</span><span class="toggle-icon">▼</span>`;
        const content = document.createElement("div"); content.className = "score-content";
        const table = document.createElement("table"); table.className = "score-table";
        let tbody = "<thead><th>Действие</th><th>Базовые очки</th><th>Количество / суммарно</th><th>Итого</th></thead><tbody>";
        baseScore[phase].forEach((item, idx) => {
            let inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="1" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="${actionMap[item[0]] || ""}">`;
            if (actionMap[item[0]] === "experience") inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="1000" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="experience" placeholder="тыс. опыта">`;
            else if (actionMap[item[0]] === "food" || actionMap[item[0]] === "metal") inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="100" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="${actionMap[item[0]]}" placeholder="всего ед.">`;
            else if (actionMap[item[0]] === "oil") inputHtml = `<input type="number" id="${phase}_${idx}" value="0" min="0" step="60" class="score-input" data-phase="${phase}" data-base="${item[1]}" data-action="oil" placeholder="всего ед.">`;
            tbody += `<tr><td>${item[0]}</td><td>${item[1]}</td><td>${inputHtml}</td><td class="score-row-total" id="total_${phase}_${idx}">0</td></tr>`;
        });
        tbody += "</tbody>";
        table.innerHTML = tbody;
        const totalDiv = document.createElement("div"); totalDiv.className = "score-total"; totalDiv.id = `total_${phase}`; totalDiv.innerText = "Итого: 0";
        const progDiv = document.createElement("div"); progDiv.className = "score-progress"; progDiv.id = `progress_${phase}`; progDiv.innerHTML = `<div class="progress-bar"><div class="progress-fill"></div><div class="progress-marks"></div></div><div class="progress-labels"></div>`;
        const addDiv = document.createElement("div"); addDiv.className = "add-points"; addDiv.innerHTML = `<input type="number" id="add_${phase}" placeholder="+ очки" value="0" step="1000"><button class="add-points-btn" data-phase="${phase}">➕ Добавить очки</button>`;
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
    container.innerHTML = `<div class="upgrade-selector"><label for="upgradeLevelSelect">Выберите уровень базы (1–30):</label><select id="upgradeLevelSelect">${Array.from({length:30}, (_,i) => `<option value="${i+1}">Уровень ${i+1}</option>`).join('')}</select><div id="upgradeDetail" class="upgrade-detail">Выберите уровень, чтобы увидеть условия</div></div>`;
    const sel = document.getElementById("upgradeLevelSelect");
    const det = document.getElementById("upgradeDetail");
    sel.addEventListener("change", () => { let row = upgradesData[parseInt(sel.value)-1]; det.innerHTML = row ? `<strong>Условие 1:</strong> ${row[1]}<br><strong>Условие 2:</strong> ${row[2]}` : "Нет данных"; });
    sel.dispatchEvent(new Event("change"));
}
function buildCalendarGroups() {
    const container = document.getElementById("calendarGroups");
    container.innerHTML = "";
    const days = ["День 1 (Воскресенье)","День 2 (Понедельник)","День 3 (Вторник)","День 4 (Среда)","День 5 (Четверг)","День 6 (Пятница)","День 7 (Суббота)"];
    const grouped = {};
    calendarData.forEach(entry => { const day = entry[0]; if (!grouped[day]) grouped[day] = []; grouped[day].push({ time: entry[1], name: entry[2] }); });
    for (let i = 1; i <= 7; i++) {
        const dayKey = `День ${i}`;
        const events = grouped[dayKey] || [];
        const card = document.createElement("div"); card.className = "calendar-group";
        const header = document.createElement("div"); header.className = "calendar-group-header";
        header.innerHTML = `<span>${days[i-1]}</span><span class="toggle-icon">▼</span>`;
        const content = document.createElement("div"); content.className = "calendar-group-content";
        events.forEach(ev => { const evDiv = document.createElement("div"); evDiv.className = "calendar-event"; evDiv.innerHTML = `<span>${ev.time}</span><span>${ev.name}</span>`; content.appendChild(evDiv); });
        header.onclick = () => { card.classList.toggle("open"); header.querySelector(".toggle-icon").innerText = card.classList.contains("open") ? "▲" : "▼"; };
        card.appendChild(header); card.appendChild(content); container.appendChild(card);
    }
}
function buildGuides() {
    const guides = [
        {title: "📡 Фаза 1. Радар", content: `<h4>Описание</h4><p>Очки за задания радара, выносливость, опыт героя, сбор ресурсов, боевые чипы/части бойца.</p><h4>Подготовка за день</h4><ul><li>Накопите 30–35 заданий (не трогайте 18 часов).</li><li>Держите полную выносливость + банки.</li><li>Отправьте отряды на сбор до старта фазы (05:00 МСК).</li></ul><h4>Старт</h4><ul><li>Выполните накопленные задания, используйте выносливость, части бойцов.</li><li>Постоянно отправляйте отряды на сбор.</li><li>Совмещайте с «Готовностью к миссии».</li></ul>`},
        {title: "🏗️ Фаза 2. Строительство", content: `<h4>Подготовка</h4><ul><li>Начните улучшать здания за несколько дней до фазы, чтобы они завершились после её старта («призрачная стройка»).</li><li>Не тратьте ускорения постройки всю неделю.</li></ul><h4>Старт</h4><ul><li>Завершите стройки → очки за мощь.</li><li>Запросите Министра строительства.</li><li>Используйте ускорения, выполните оранжевую миссию, отправьте легендарный транспортник.</li></ul>`},
        {title: "🔬 Фаза 3. Технологии", content: `<h4>Главная стратегия</h4><p>Копите ускорения исследований и научные данные всю неделю, вливайте строго в среду.</p><h4>План</h4><ul><li>Закройте радар, используйте ускорения, завершите долгие исследования.</li><li>Тратьте научные данные, открывайте сундуки с компонентами.</li><li>Запросите Министра науки.</li></ul>`},
        {title: "🦸 Фаза 4. Герой", content: `<h4>Подготовка</h4><ul><li>Копите опыт героя, карты найма, фрагменты, книги навыков.</li></ul><h4>Старт</h4><ul><li>Сначала карты найма → опыт героя → фрагменты (мифические → эпические → редкие) → книги навыков.</li><li>Совмещайте с «Готовностью к миссии».</li></ul>`},
        {title: "⚔️ Фаза 5. Боеготовность", content: `<h4>Действия</h4><ul><li>Используйте ускорения постройки, исследований, тренировок.</li><li>Обучайте солдат в указанные интервалы (очки сразу).</li><li>Используйте переобучение (Т6→Т8) для экономии ускорений.</li></ul>`},
        {title: "🏆 Фаза 6. Рейд", content: `<h4>Подготовка</h4><ul><li>Купите щит, отключите оборону в гарнизоне.</li><li>Ресурсы держите в инвентаре, освободите госпиталь.</li></ul><h4>Во время рейда</h4><ul><li>Разведывайте цели, атакуйте, не обнуляйте базы без сопротивления.</li><li>Следите за HP базы, не телепортируйтесь в лагерь во время боя.</li></ul>`},
        {title: "🎯 Готовность к миссии", content: `<h4>Обучение солдат</h4><ul><li>Должность Министра обороны, перед событием лагеря пусты.</li><li>Тренируйте Т6, затем улучшайте до Т8 (дешевле).</li></ul><h4>Улучшение бойца</h4><ul><li>Тратьте энергию (~300 ед.), используйте бесплатное восстановление 2 раза.</li></ul><h4>Улучшение героя</h4><ul><li>Тратьте накопленный опыт и книги.</li></ul><p>Стройку и науку не трогайте — оставьте ускорения для Битвы Альянсов.</p>`},
        {title: "📊 Аналитика событий", content: `<h4>Основные выводы</h4><ul><li>Главная сила сервера — активность в Состязании альянсов (VS) и массовость топ-игроков.</li><li>Слабые места: суммарный урон по Гигантскому боссу и активность в «Готовности к миссии».</li><li>Тактика: организовывать массовые атаки босса («зерг-раш»), контролировать грабежи транспортников (бить только целые фуры).</li><li>Для победы в войне серверов важна не столько сила отдельных китов, сколько скоординированность всех игроков.</li></ul><p>Используйте аналитику для планирования: уделяйте внимание боссу, не пропускайте сундуки готовности, контролируйте грабежи.</p>`}
    ];
    const cont = document.getElementById("guidesContainer");
    cont.innerHTML = "";
    guides.forEach(g => {
        const card = document.createElement("div"); card.className = "guide-card";
        const head = document.createElement("div"); head.className = "guide-header";
        head.innerHTML = `<span>${g.title}</span><span class="toggle-icon">▼</span>`;
        const body = document.createElement("div"); body.className = "guide-content"; body.innerHTML = g.content;
        head.onclick = () => { card.classList.toggle("open"); const ic = head.querySelector(".toggle-icon"); ic.innerText = card.classList.contains("open") ? "▲" : "▼"; };
        card.appendChild(head); card.appendChild(body); cont.appendChild(card);
    });
}
function getCurrentPhaseAndNext() {
    const now = new Date();
    const weekday = getWeekdayName();
    const phaseNames = { "Понедельник":"Фаза 1. Радар", "Вторник":"Фаза 2. Строительство", "Среда":"Фаза 3. Технологии", "Четверг":"Фаза 4. Герой", "Пятница":"Фаза 5. Боеготовность", "Суббота":"Фаза 6. Рейд" };
    let current = null, next = null;
    if (phaseNames[weekday]) {
        let end = new Date(now); end.setHours(9,0,0,0);
        if (now < end) end.setDate(now.getDate()-1); else end.setDate(now.getDate()+1);
        current = { name: phaseNames[weekday], end: end };
    }
    const days = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
    let idx = days.indexOf(weekday);
    for (let i=1; i<=7; i++) {
        let nd = days[(idx+i)%7];
        if (phaseNames[nd]) {
            let st = new Date(now); st.setDate(now.getDate()+i); st.setHours(9,0,0,0);
            next = { name: phaseNames[nd], start: st }; break;
        }
    }
    return { currentPhase: current, nextPhase: next };
}
function getNextCalendarEvent() {
    const now = new Date(), gd = getGameDayCorrected();
    let best = Infinity, bestEv = null;
    for (let [d,t,e] of calendarData) {
        let dn = parseInt(d.split(" ")[1]), [h,m,s] = t.split(":").map(Number);
        let dt = new Date(now); dt.setHours(h,m,s,0);
        let ahead = (dn - gd + 7) % 7;
        dt.setDate(now.getDate() + ahead);
        if (ahead===0 && dt<=now) dt.setDate(now.getDate()+7);
        let diff = dt-now;
        if (diff>0 && diff<best) { best=diff; bestEv={name:e,delta:diff}; }
    }
    if (bestEv) { let ts = Math.floor(bestEv.delta/1000); return { name: bestEv.name, hours: Math.floor(ts/3600), minutes: Math.floor((ts%3600)/60), seconds: ts%60 }; }
    return null;
}
function updateTimeDisplay() {
    const now = new Date();
    document.getElementById("localTime").innerText = now.toLocaleString("ru-RU");
    document.getElementById("gameDay").innerText = getGameDayCorrected();
    document.getElementById("weekdayName").innerText = getWeekdayName();
    let { currentPhase, nextPhase } = getCurrentPhaseAndNext();
    let html = "";
    if (currentPhase) html += `🔹 Текущая фаза: ${currentPhase.name}<br>`;
    if (nextPhase) { let rem = Math.max(0,(nextPhase.start-now)/1000); html += `⏰ До следующей фазы: ${Math.floor(rem/3600)} ч ${Math.floor((rem%3600)/60)} мин ${Math.floor(rem%60)} сек`; }
    else html += "⏰ До следующей фазы: нет данных";
    document.getElementById("phaseInfo").innerHTML = html;
    let nxt = getNextCalendarEvent();
    document.getElementById("nextEvent").innerHTML = nxt ? `➡ ${nxt.name} через ${nxt.hours} ч ${nxt.minutes} мин` : "➡ Нет ближайших событий";
}
function updateReminder() {
    const day = getWeekdayName();
    const tips = {
        "Воскресенье": ["📡 Не выполняйте задания радара — копите до понедельника.", "🚚 Отправьте отряды в ночь на сбор ресурсов.", "⚡ Подготовьте выносливость и банки."],
        "Понедельник": ["🎯 Сразу выполните накопленные задания радара.", "💪 Используйте части бойцов, боевые чипы, выносливость.", "🔄 Постоянно отправляйте отряды на сбор ресурсов.", "🤝 Совмещайте с Готовностью к миссии."],
        "Вторник": ["🏗️ Завершите «призрачную стройку».", "📈 Используйте ускорения постройки.", "✉️ Выполните оранжевую миссию и отправьте легендарный транспортник."],
        "Среда": ["🔬 Не тратьте ускорения исследований всю неделю — используйте сегодня.", "📡 Закройте радар.", "📦 Откройте сундуки с компонентами.", "🧪 Запросите Министра науки."],
        "Четверг": ["🦸 Используйте опыт героя, карты найма.", "🎴 Тратьте фрагменты героев (мифические→эпические→редкие).", "📖 Примените книги навыков.", "📡 Копите радар на завтра."],
        "Пятница": ["⚔️ Совмещайте ускорения постройки, исследований и тренировок.", "🎓 Обучайте солдат в интервалы.", "🛡️ Подготовьте щит на субботу."],
        "Суббота": ["🏆 Используйте оставшиеся ускорения.", "⚔️ Участвуйте в рейдах, убивайте солдат.", "🛡️ Не бойтесь потерь — они дают очки.", "🚫 Отключите оборону в гарнизоне, держите ресурсы в инвентаре."]
    };
    let list = tips[day] || ["📅 Следуйте расписанию фаз."];
    document.getElementById("reminder").innerHTML = `<strong>📌 Напоминание на ${day}</strong><ul>${list.map(t=>`<li>${t}</li>`).join('')}</ul>`;
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
    items.forEach((it,i)=>{ let txt={1:"1 минута",5:"5 минут",60:"1 час",240:"4 часа",480:"8 часов"}[it.durationMinutes]; const li=document.createElement("li"); li.innerText=`${it.quantity} шт × ${txt}`; li.onclick=()=>{ document.querySelectorAll("#itemsList li").forEach(l=>l.classList.remove("selected")); li.classList.add("selected"); selectedIdx=i; }; ul.appendChild(li); });
}
function addItem() { let q=parseInt(document.getElementById("itemQty").value), d=parseInt(document.getElementById("durationSelect").value); if(q>0){ items.push({quantity:q,durationMinutes:d}); renderItems(); updateResult(); } else alert("Количество >0"); }
function editItem() { if(selectedIdx!==-1){ let it=items[selectedIdx]; document.getElementById("itemQty").value=it.quantity; document.getElementById("durationSelect").value=it.durationMinutes; items.splice(selectedIdx,1); selectedIdx=-1; renderItems(); updateResult(); } else alert("Выберите предмет"); }
function delItem() { if(selectedIdx!==-1){ items.splice(selectedIdx,1); selectedIdx=-1; renderItems(); updateResult(); } else alert("Выберите предмет"); }
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
    document.getElementById("convertResult").innerHTML = `${Math.floor(result)} ${to==="steel"?"стали":to==="steelComp"?"стальных компонентов":to==="heatGold"?"жаропрочного золота":to==="composite"?"композитного материала":"проводящих кристаллов"}`;
}
function calcGearUpgrade() {
    let cur = parseInt(document.getElementById("gearCur").value) || 0;
    let tar = parseInt(document.getElementById("gearTar").value) || 0;
    if (cur>=tar) { alert("Целевой уровень должен быть выше текущего"); return; }
    let totalStone = 0, totalOil = 0;
    for (let i=cur; i<tar; i++) {
        let cost = gearUpgradeCost.find(c => c.from === i);
        if (cost) { totalStone += cost.stone; totalOil += cost.oil; }
        else { alert(`Нет данных для уровня ${i}→${i+1}`); return; }
    }
    document.getElementById("gearResult").innerHTML = `Очищенных камней: ${totalStone}<br>Нефти: ${totalOil.toLocaleString()}`;
}
function calcStarCost() {
    let star = document.querySelector('input[name="starType"]:checked').value;
    let stone, crystals, oil;
    if (star === "star1") { stone = 12000 * 5; crystals = 145 * 5; oil = 20000000 * 5; }
    else { stone = 16000 * 5; crystals = 200 * 5; oil = 30000000 * 5; }
    document.getElementById("starResult").innerHTML = `Очищенных камней: ${stone}<br>Проводящих кристаллов: ${crystals}<br>Нефти: ${oil.toLocaleString()}`;
}

document.addEventListener("DOMContentLoaded", () => {
    buildPhases();
    buildScoreCalculator();
    buildUpgrades();
    buildCalendarGroups();
    buildGuides();
    updateReminder();
    updateEventTimers();
    setInterval(() => { updateTimeDisplay(); updateEventTimers(); updateReminder(); }, 1000);
    document.getElementById("collapseTimeBtn").addEventListener("click", () => document.getElementById("timePanel").classList.toggle("collapsed"));
    const calcBody = document.getElementById("calcBody"), calcIcon = document.getElementById("calcToggleIcon"); let calcCollapsed = false;
    document.getElementById("toggleCalculator").addEventListener("click", () => {
        if(calcCollapsed){ calcBody.style.maxHeight=calcBody.scrollHeight+"px"; calcIcon.innerText="▼"; setTimeout(()=>calcBody.style.maxHeight="none",300); }
        else{ calcBody.style.maxHeight=calcBody.scrollHeight+"px"; setTimeout(()=>calcBody.style.maxHeight="0",10); calcIcon.innerText="▲"; }
        calcCollapsed=!calcCollapsed;
    }); calcBody.style.maxHeight="none";
    document.getElementById("addItemBtn").onclick=addItem; document.getElementById("editItemBtn").onclick=editItem; document.getElementById("delItemBtn").onclick=delItem; document.getElementById("resetAllBtn").onclick=resetAll;
    document.getElementById("resetStartBtn").onclick=()=>{ document.getElementById("startDays").value=0; document.getElementById("startHours").value=0; document.getElementById("startMinutes").value=0; document.getElementById("startSeconds").value=0; updateResult(); };
    document.querySelectorAll("#startDays, #startHours, #startMinutes, #startSeconds").forEach(e=>e.addEventListener("input",updateResult));
    document.querySelectorAll('input[name="mode"]').forEach(r=>r.addEventListener("change",updateResult));
    updateResult();
    document.getElementById("convertBtn").onclick = convertComponent;
    document.getElementById("calcGearUpgrade").onclick = calcGearUpgrade;
    document.getElementById("calcStarCost").onclick = calcStarCost;
    const themeToggle = document.getElementById("themeToggle"); let dark=false;
    themeToggle.onclick = () => { dark=!dark; document.body.classList.toggle("dark",dark); themeToggle.innerText=dark?"☀️ Светлая":"🌙 Тёмная"; };
    const tabBtns = document.querySelectorAll(".tab-button"), tabs = document.querySelectorAll(".tab-content");
    tabBtns.forEach(btn => { btn.addEventListener("click", () => { let tab=btn.dataset.tab; tabBtns.forEach(b=>b.classList.remove("active")); btn.classList.add("active"); tabs.forEach(t=>t.classList.remove("active")); document.getElementById(`tab-${tab}`).classList.add("active"); }); });
});
