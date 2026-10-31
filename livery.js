/* 模拟飞行涂装站：读取 LiveryAPI，提供搜索、筛选、分页和详情查看。 */
(function () {
    "use strict";
    if (!document.body.classList.contains("livery-page")) return;

    const API = "https://api.xn--3ckue.jp/api/v1/liveries";
    const grid = document.getElementById("livery-grid");
    const result = document.getElementById("livery-result-count");
    const pagination = document.getElementById("livery-pagination");
    const search = document.getElementById("livery-search");
    const form = document.getElementById("livery-search-form");
    const reset = document.getElementById("livery-reset");
    const modal = document.getElementById("livery-modal");
    const modalContent = document.getElementById("livery-modal-content");
    const status = document.querySelector(".livery-api-status");
    let game = "", keyword = "", page = 1, data = {items: [], total: 0, total_pages: 0}, apiUnavailable = false, apiRateLimited = false;

    const text = {
        zh: {all: "全部", loading: "正在载入涂装…", count: "显示 {n} 套涂装", empty: "没有找到匹配的涂装。", error: "API 暂时无法连接，涂装列表不可用。", rateLimit: "API 请求次数过多，请稍等再试。", detail: "涂装详情", aircraft: "机型", game: "模拟器", version: "版本", download: "下载涂装", cn: "国内下载", global: "全球下载", noDownload: "暂无下载地址", close: "关闭"},
        en: {all: "All", loading: "Loading liveries…", count: "Showing {n} liveries", empty: "No liveries matched.", error: "The API is unavailable. The livery list cannot be displayed.", rateLimit: "Too many API requests. Please wait and try again.", detail: "Livery details", aircraft: "Aircraft", game: "Simulator", version: "Version", download: "Download", cn: "CN mirror", global: "Global mirror", noDownload: "No download link", close: "Close"},
        ja: {all: "すべて", loading: "塗装を読み込み中…", count: "{n}件の塗装", empty: "一致する塗装がありません。", rateLimit: "APIリクエストが多すぎます。しばらくしてから再試行してください。", error: "APIに接続できないため、塗装一覧を表示できません。", detail: "塗装の詳細", aircraft: "機体", game: "シミュレーター", version: "バージョン", download: "ダウンロード", cn: "中国ミラー", global: "グローバル", noDownload: "ダウンロード先なし", close: "閉じる"}
    };
    const lang = () => text[document.documentElement.dataset.language || "zh"] || text.zh;
    const esc = (v) => String(v || "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    const labelGame = (v) => String(v || "—").toUpperCase();

    function setStatus(offline) { if (!status) return; status.classList.toggle("is-offline", offline); const node = status.querySelector("span"); if (node) node.textContent = offline ? "API OFFLINE" : "API LIVE"; }
    function queryUrl() { const params = new URLSearchParams({page: String(page), page_size: "20"}); if (keyword) params.set("search", keyword); if (game) params.set("game", game); return `${API}?${params}`; }
    async function load() {
        grid.innerHTML = `<p class="livery-loading">${esc(lang().loading)}</p>`;
        try {
            const response = await fetch(queryUrl(), {cache: "no-store"});
            if (response.status === 429) {
                apiRateLimited = true;
                throw new Error("rate-limit");
            }
            if (!response.ok) throw new Error(response.status);
            data = await response.json();
            apiUnavailable = false;
            apiRateLimited = false;
            setStatus(false);
        } catch (error) {
            data = {items: [], total: 0, total_pages: 0};
            if (error.message !== "rate-limit") apiUnavailable = true;
            setStatus(true);
        }
        render();
    }
    function render() {
        const items = Array.isArray(data.items) ? data.items : [];
        setStatus(apiUnavailable);
        result.textContent = apiRateLimited ? lang().rateLimit : apiUnavailable ? lang().error : lang().count.replace("{n}", String(data.total ?? items.length));
        reset.hidden = !game && !keyword;
        document.querySelectorAll("[data-count]").forEach((node) => { node.textContent = node.dataset.count === "all" ? (data.total ?? items.length) : (items.filter((item) => item.game === node.dataset.count).length || "—"); });
        if (apiRateLimited) grid.innerHTML = `<p class="livery-empty">${esc(lang().rateLimit)}</p>`;
        else if (apiUnavailable) grid.innerHTML = `<p class="livery-empty">${esc(lang().error)}</p>`;
        else if (!items.length) grid.innerHTML = `<p class="livery-empty">${esc(lang().empty)}</p>`;
        else grid.innerHTML = items.map(card).join("");
        renderPagination();
        grid.querySelectorAll(".livery-card-image img").forEach((image) => image.addEventListener("error", () => image.classList.add("is-broken")));
        grid.querySelectorAll("[data-livery-id]").forEach((node) => node.addEventListener("click", () => openDetail(items.find((item) => String(item.id) === node.dataset.liveryId))));
    }
    function card(item) {
        const image = item.image_url ? `<img alt="" loading="lazy" src="${esc(item.image_url)}">` : "✈";
        return `<article class="livery-card"><div class="livery-card-image">${image}</div><div class="livery-card-body"><div class="livery-card-game"><span>${esc(labelGame(item.game))}</span><span>#${esc(item.id)}</span></div><h3>${esc(item.name || "Untitled livery")}</h3><p class="livery-card-aircraft">${esc(item.aircraft || "Aircraft not specified")}</p><div class="livery-card-footer"><button class="livery-card-action" data-livery-id="${esc(item.id)}" type="button">${esc(lang().detail)} ↗</button><span class="livery-card-version">${esc(item.version || "—")}</span></div></div></article>`;
    }
    function renderPagination() { pagination.innerHTML = ""; const totalPages = Number(data.total_pages || 1); if (totalPages <= 1) return; for (let i = 1; i <= totalPages; i += 1) { const button = document.createElement("button"); button.className = `livery-page-button${i === page ? " is-active" : ""}`; button.textContent = String(i).padStart(2, "0"); button.type = "button"; button.addEventListener("click", () => {page = i; load(); document.getElementById("livery-list").scrollIntoView({behavior: "smooth"});}); pagination.appendChild(button); } }
    function openDetail(item) {
        if (!item) return;
        const links = [[item.download_url_cn, lang().cn], [item.download_url_global, lang().global]].filter(([url]) => url).map(([url, name]) => `<a class="button button-secondary" href="${esc(url)}" rel="noopener noreferrer" target="_blank">${esc(name)} ↗</a>`).join("");
        modalContent.innerHTML = `<div class="livery-detail"><p class="eyebrow">${esc(lang().detail)} / ${esc(labelGame(item.game))}</p><h2>${esc(item.name)}</h2><p>${esc(item.description || "")}</p><div class="livery-detail-meta"><div><span>${esc(lang().aircraft)}</span><strong>${esc(item.aircraft || "—")}</strong></div><div><span>${esc(lang().game)}</span><strong>${esc(labelGame(item.game))}</strong></div><div><span>${esc(lang().version)}</span><strong>${esc(item.version || "—")}</strong></div><div><span>ID</span><strong>${esc(item.id)}</strong></div></div><p>${esc(lang().download)}</p><div class="livery-downloads">${links || `<span class="livery-card-version">${esc(lang().noDownload)}</span>`}</div></div>`;
        modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    }
    function closeDetail() { modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
    document.querySelectorAll(".livery-chip").forEach((button) => button.addEventListener("click", () => { game = button.dataset.game; page = 1; document.querySelectorAll(".livery-chip").forEach((item) => {const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active));}); load(); }));
    form.addEventListener("submit", (event) => {event.preventDefault(); keyword = search.value.trim(); page = 1; load();});
    reset.addEventListener("click", () => {game = ""; keyword = ""; search.value = ""; page = 1; document.querySelector('.livery-chip[data-game=""]').click();});
    document.querySelectorAll("[data-close-livery]").forEach((node) => node.addEventListener("click", closeDetail));
    document.addEventListener("keydown", (event) => {if (event.key === "Escape") closeDetail();});
    document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => window.setTimeout(render, 0)));
    load();
})();
