/* 看番记录单 —— 数据来自 anime-data.json，渲染、筛选与搜索都在这里完成 */
(function () {
  "use strict";

  const ANIME_PAGE = document.body.classList.contains("anime-page");
  if (!ANIME_PAGE) {
    return;
  }

  const root = document.documentElement;
  const groupsContainer = document.getElementById("anime-groups");
  const statsContainer = document.getElementById("anime-stats");
  const searchInput = document.getElementById("anime-search");
  const filterButtons = Array.from(document.querySelectorAll(".anime-chip"));
  const resetButton = document.querySelector(".anime-reset");
  const resultCount = document.querySelector(".anime-result-count");
  const updatedLabel = document.getElementById("anime-updated");
  const fallbackNode = document.getElementById("anime-data-fallback");

  const pageText = {
    zh: {
      documentTitle: "看番记录单 | xiaotian7196",
      description: "Xiaotian 的看番记录单：日漫、剧场版与国漫列表",
      animeEyebrow: "观看记录 / WATCHLIST",
      animeTitle: "看番记录单",
      animeIntro: "从 2022 年前后开始断断续续记下来的清单，主要是日漫、剧场版，也有一些国漫。数量还在慢慢增加。",
      animeStatTotal: "全部作品",
      animeCatTv: "日漫",
      animeCatMovie: "剧场版",
      animeCatCn: "国漫",
      animeBack: "返回主页",
      animeSourceLink: "查看博客原帖",
      animeListTitle: "我看过的番！",
      animeListIntro: "按分类浏览，也可以直接搜索作品名",
      animeFilterAll: "全部",
      animeSearchPlaceholder: "搜索作品名…",
      animeResultCount: "共 {n} 部作品",
      animeReset: "清除筛选",
      animeLoading: "正在载入清单…",
      animeEmpty: "没有匹配的作品，换个关键词试试",
      animeLoadError: "清单载入失败，请通过本地服务器打开此页面",
      animeFooterNote: "清单内容来自我的博客《看番记录单》，页面会随着观看进度更新",
      animeDataNote: "中文名为 B 站常用译名，日文名为官方原名；英文界面下同样显示日文原名。",
      animeUpdatedLabel: "最后整理于",
      animeSkip: "跳到番剧列表",
      animeHome: "主页",
      animePageLink: "看番记录",
      animeBlog: "博客"
    },
    en: {
      documentTitle: "Watchlist | xiaotian7196",
      description: "Xiaotian's watchlist of Japanese anime, anime films and Chinese animation",
      animeEyebrow: "WATCHLIST / ANIME LOG",
      animeTitle: "Watchlist",
      animeIntro: "A list I have kept since around 2022 — mostly Japanese TV anime and films, plus a few Chinese series. It keeps growing.",
      animeStatTotal: "Total titles",
      animeCatTv: "Japanese TV anime",
      animeCatMovie: "Anime films",
      animeCatCn: "Chinese animation",
      animeBack: "Back to home",
      animeSourceLink: "Original blog post",
      animeListTitle: "All titles",
      animeListIntro: "Browse by category, or search for a title",
      animeFilterAll: "All",
      animeSearchPlaceholder: "Search titles…",
      animeResultCount: "{n} titles",
      animeReset: "Clear filters",
      animeLoading: "Loading the list…",
      animeEmpty: "No titles matched — try another keyword",
      animeLoadError: "Could not load the list. Open this page through a local server.",
      animeFooterNote: "The list comes from my blog post “Watchlist” and is updated as I keep watching",
      animeDataNote: "Chinese titles are the common Chinese translations; Japanese titles are the official originals and are also shown in the English view.",
      animeUpdatedLabel: "Last updated",
      animeSkip: "Skip to the anime list",
      animeHome: "Home",
      animePageLink: "Watchlist",
      animeBlog: "Blog"
    },
    ja: {
      documentTitle: "視聴記録 | xiaotian7196",
      description: "Xiaotianの視聴記録：日本のアニメ、劇場版、中国アニメのリスト",
      animeEyebrow: "視聴記録 / WATCHLIST",
      animeTitle: "視聴記録",
      animeIntro: "2022年ごろから少しずつ記録しているリストです。日本のテレビアニメと劇場版が中心で、中国アニメも少しあります。",
      animeStatTotal: "全作品",
      animeCatTv: "日本のアニメ",
      animeCatMovie: "劇場版",
      animeCatCn: "中国アニメ",
      animeBack: "ホームに戻る",
      animeSourceLink: "ブログの元記事",
      animeListTitle: "私が見たアニメ！",
      animeListIntro: "カテゴリで絞り込むか、タイトルで検索できます",
      animeFilterAll: "すべて",
      animeSearchPlaceholder: "タイトルを検索…",
      animeResultCount: "全 {n} 作品",
      animeReset: "絞り込みを解除",
      animeLoading: "リストを読み込み中…",
      animeEmpty: "該当する作品がありません",
      animeLoadError: "リストを読み込めませんでした。ローカルサーバー経由で開いてください。",
      animeFooterNote: "リストはブログ「視聴記録」からのもので、視聴が進むと更新されます",
      animeDataNote: "中国語タイトルは一般的な中国語訳、日本語タイトルは公式の原題です。英語表示でも日本語の原題を表示します。",
      animeUpdatedLabel: "最終更新",
      animeSkip: "作品一覧へ移動",
      animeHome: "ホーム",
      animePageLink: "視聴記録",
      animeBlog: "ブログ"
    }
  };

  let data = { meta: {}, categories: [], items: [] };
  let activeFilter = "all";
  let keyword = "";
  let revealObserver = null;

  function currentLanguage() {
    const language = root.dataset.language || "zh";
    return pageText[language] ? language : "zh";
  }

  function t(key) {
    return pageText[currentLanguage()][key] || key;
  }

  /* 英文界面按需求显示日文原名 */
  function displayTitle(item) {
    return currentLanguage() === "zh" ? item.zh : item.ja;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function validData(candidate) {
    return candidate
      && Array.isArray(candidate.items)
      && candidate.items.length > 0
      && Array.isArray(candidate.categories);
  }

  function readFallback() {
    if (!fallbackNode) {
      return null;
    }
    try {
      return JSON.parse(fallbackNode.textContent);
    } catch {
      return null;
    }
  }

  function loadData() {
    const fallback = readFallback();
    return fetch("anime-data.json", { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => (validData(payload) ? payload : fallback))
      .catch(() => fallback);
  }

  function categoryLabel(id) {
    const category = data.categories.find((entry) => entry.id === id);
    if (category && category.labels) {
      return category.labels[currentLanguage()] || category.labels.zh || id;
    }
    return id;
  }

  function categoryOrder() {
    return data.categories.map((entry) => entry.id);
  }

  function isVisible(item) {
    if (activeFilter !== "all" && item.category !== activeFilter) {
      return false;
    }
    if (!keyword) {
      return true;
    }
    return normalize(item.zh).includes(keyword)
      || normalize(item.ja).includes(keyword)
      || normalize(item.id).includes(keyword);
  }

  function updateStats() {
    const counts = { all: data.items.length };
    categoryOrder().forEach((id) => {
      counts[id] = data.items.filter((item) => item.category === id).length;
    });

    if (statsContainer) {
      statsContainer.querySelectorAll("[data-stat-value]").forEach((node) => {
        node.textContent = String(counts[node.dataset.statValue] || 0).padStart(2, "0");
      });
    }

    document.querySelectorAll("[data-count]").forEach((node) => {
      node.textContent = String(counts[node.dataset.count] || 0);
    });
  }

  function updateFilterButtons() {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (resetButton) {
      resetButton.hidden = activeFilter === "all" && keyword === "";
    }
  }

  function updateFilterLabels() {
    filterButtons.forEach((button) => {
      const labelNode = button.querySelector("span");
      const filter = button.dataset.filter;
      if (!labelNode) {
        return;
      }
      labelNode.textContent = filter === "all" ? t("animeFilterAll") : categoryLabel(filter);
    });
  }

  function observeCard(card) {
    if (!revealObserver) {
      card.classList.add("is-visible");
      return;
    }
    revealObserver.observe(card);
  }

  function createRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      return null;
    }
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.06 });
  }

  function renderGroups() {
    const visibleItems = data.items.filter(isVisible);

    if (resultCount) {
      resultCount.textContent = t("animeResultCount").replace("{n}", String(visibleItems.length));
    }

    if (!visibleItems.length) {
      groupsContainer.innerHTML = `<p class="anime-empty">${escapeHtml(t("animeEmpty"))}</p>`;
      return;
    }

    const order = categoryOrder();
    const parts = [];

    order.forEach((categoryId) => {
      const items = visibleItems.filter((item) => item.category === categoryId);
      if (!items.length) {
        return;
      }

      const cards = items.map((item, index) => {
        const zhClass = currentLanguage() === "zh" ? "" : " is-secondary";
        const jaClass = currentLanguage() === "zh" ? " is-secondary" : "";
        return `<article class="anime-card" style="--reveal-delay:${Math.min(index, 12) * 45}ms">
          <span class="anime-card-no" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <h4 class="anime-card-title" lang="${currentLanguage() === "zh" ? "zh-CN" : "ja"}">${escapeHtml(displayTitle(item))}</h4>
          <p class="anime-card-alt">
            <span class="anime-card-zh${zhClass}" lang="zh-CN">${escapeHtml(item.zh)}</span>
            <span class="anime-card-ja${jaClass}" lang="ja">${escapeHtml(item.ja)}</span>
          </p>
        </article>`;
      }).join("");

      parts.push(`<section class="anime-group">
        <div class="anime-group-head">
          <h3>${escapeHtml(categoryLabel(categoryId))}</h3>
          <span class="anime-group-count">${items.length}</span>
        </div>
        <div class="anime-grid">${cards}</div>
      </section>`);
    });

    groupsContainer.innerHTML = parts.join("");
    groupsContainer.querySelectorAll(".anime-card").forEach(observeCard);
  }

  function renderUpdated() {
    if (!updatedLabel) {
      return;
    }
    updatedLabel.textContent = data.meta && data.meta.updated ? data.meta.updated : "--";
  }

  function applyAnimeLanguage() {
    const language = currentLanguage();
    document.title = pageText[language].documentTitle;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", pageText[language].description);
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (pageText[language][key]) {
        element.textContent = pageText[language][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (pageText[language][key]) {
        element.setAttribute("placeholder", pageText[language][key]);
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const key = element.dataset.i18nAria;
      if (pageText[language][key]) {
        element.setAttribute("aria-label", pageText[language][key]);
      }
    });

    updateFilterLabels();
    updateStats();
    renderGroups();
  }

  function bindControls() {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        updateFilterButtons();
        renderGroups();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        keyword = normalize(searchInput.value);
        updateFilterButtons();
        renderGroups();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        activeFilter = "all";
        keyword = "";
        if (searchInput) {
          searchInput.value = "";
        }
        updateFilterButtons();
        renderGroups();
      });
    }

    document.querySelectorAll(".language-switcher [data-lang]").forEach((button) => {
      button.addEventListener("click", () => window.requestAnimationFrame(applyAnimeLanguage));
    });
  }

  function initialize() {
    revealObserver = createRevealObserver();
    bindControls();

    renderUpdated();
    updateFilterButtons();

    loadData()
      .then((payload) => {
        if (!validData(payload)) {
          groupsContainer.innerHTML = `<p class="anime-empty">${escapeHtml(t("animeLoadError"))}</p>`;
          return;
        }
        data = payload;
        renderUpdated();
        applyAnimeLanguage();
        if (window.initializeScrollAnimations) {
          window.initializeScrollAnimations();
        }
      });
  }

  initialize();
})();
