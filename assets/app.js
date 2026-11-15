/* =========================================================
   首頁互動：產生卡片、分類／狀態篩選、隨機抽一家
   資料來源：data/shops.js（window.SHOPS）
   ========================================================= */

// 分類清單（順序與 emoji 需與 AGENTS.md 第 5 節一致）
const CATEGORIES = [
  { name: "小吃", emoji: "🥢" },
  { name: "早午餐", emoji: "🍳" },
  { name: "甜點", emoji: "🍰" },
  { name: "咖啡", emoji: "☕" },
  { name: "飲料", emoji: "🧋" },
  { name: "宵夜", emoji: "🌙" }
];

const STATUS_LABEL = { want: "🔖 想去", visited: "✅ 吃過" };

const state = { category: "全部", status: "全部" };
const shops = window.SHOPS || [];

const $ = (sel) => document.querySelector(sel);

function stars(n) {
  return n ? "★".repeat(n) + "☆".repeat(5 - n) : "";
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function cardHTML(shop) {
  const rating = shop.status === "visited" && shop.rating
    ? `<span class="stars" aria-label="${shop.rating} 顆星">${stars(shop.rating)}</span>`
    : "";
  return `
    <a class="card cat-${shop.category}" href="shops/${shop.id}.html" data-id="${shop.id}">
      <div class="card-top">
        <span class="card-emoji" aria-hidden="true">${shop.emoji}</span>
        <span class="status ${shop.status}">${STATUS_LABEL[shop.status]}</span>
      </div>
      <h3>${escapeHTML(shop.name)}</h3>
      <p class="card-tagline">${escapeHTML(shop.tagline)}</p>
      <div class="card-meta">
        <span class="tag cat">${shop.category}</span>
        <span class="tag">${shop.price}</span>
        <span class="area">📍 ${escapeHTML(shop.area)}</span>
        ${rating}
      </div>
    </a>`;
}

function filtered() {
  return shops.filter((s) =>
    (state.category === "全部" || s.category === state.category) &&
    (state.status === "全部" || s.status === state.status)
  );
}

function render() {
  const list = filtered();
  $("#grid").innerHTML = list.map(cardHTML).join("");
  $("#empty").classList.toggle("show", list.length === 0);
  $("#picker-result").classList.remove("show");
}

function renderCounts() {
  const visited = shops.filter((s) => s.status === "visited").length;
  $("#count-total").textContent = shops.length;
  $("#count-visited").textContent = visited;
}

function makeChips(container, items, key) {
  container.innerHTML = items.map((it) =>
    `<button class="chip${state[key] === it.value ? " active" : ""}" data-value="${it.value}">${it.label}</button>`
  ).join("");
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state[key] = btn.dataset.value;
    container.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));
    render();
  });
}

function pickOne() {
  const list = filtered();
  const box = $("#picker-result");
  if (list.length === 0) {
    box.innerHTML = "<span>目前篩選條件下沒有店家，換個條件再抽一次吧！</span>";
    box.classList.add("show");
    return;
  }
  const shop = list[Math.floor(Math.random() * list.length)];
  const picker = $("#picker");
  picker.classList.remove("rolling"); void picker.offsetWidth; picker.classList.add("rolling");
  box.classList.remove("show");
  void box.offsetWidth; // 重新觸發動畫
  box.innerHTML = `
    <span class="big-emoji" aria-hidden="true">${shop.emoji}</span>
    <div>馬尼喵說：今天就吃這家！<br><a href="shops/${shop.id}.html">${escapeHTML(shop.name)} →</a></div>`;
  box.classList.add("show");
  document.querySelectorAll(".card").forEach((c) =>
    c.classList.toggle("picked", c.dataset.id === shop.id));
}

document.addEventListener("DOMContentLoaded", () => {
  makeChips($("#filter-category"),
    [{ value: "全部", label: "全部" }, ...CATEGORIES.map((c) => ({ value: c.name, label: `${c.emoji} ${c.name}` }))],
    "category");
  makeChips($("#filter-status"),
    [{ value: "全部", label: "全部" }, { value: "want", label: STATUS_LABEL.want }, { value: "visited", label: STATUS_LABEL.visited }],
    "status");
  $("#pick-btn").addEventListener("click", pickOne);
  renderCounts();
  render();
});
