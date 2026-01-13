class NewsApp {
  constructor() {
    this.API_KEY = "8dbaacd25d6c31a6aee6f80ca8394805";
    this.BASE_URL = "https://gnews.io/api/v4";

    this.categoryMap = {
      general: "world",        // FIX ✅
      business: "business",
      entertainment: "entertainment",
      health: "health",
      science: "science",
      sports: "sports"
    };

    this.state = {
      category: "general",
      query: "",
      page: 1,
      pageSize: 9,
      loading: false
    };

    this.init();
  }

  init() {
    this.setupTheme();
    this.setupEvents();
    this.loadNews();
  }

  /* ---------- THEME ---------- */
  setupTheme() {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("themeIcon").textContent =
      theme === "dark" ? "☀️" : "🌙";
  }

  /* ---------- EVENTS ---------- */
  setupEvents() {
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.addEventListener("click", () => this.changeCategory(btn.dataset.category));
    });

    let debounce;
    document.getElementById("searchInput").addEventListener("input", e => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.search(e.target.value.trim());
      }, 500);
    });
  }

  /* ---------- API ---------- */
  buildUrl() {
    const params = new URLSearchParams({
      token: this.API_KEY,
      lang: "en",
      max: this.state.pageSize
    });

    if (this.state.query) {
      params.append("q", this.state.query);
    } else {
      params.append("topic", this.categoryMap[this.state.category]);
    }

    return `${this.BASE_URL}/top-headlines?${params}`;
  }

  async loadNews() {
    this.toggleLoading(true);

    try {
      const res = await fetch(this.buildUrl());
      const data = await res.json();

      if (!data.articles || data.articles.length === 0) {
        this.showError("No news found");
        return;
      }

      this.renderNews(data.articles);
    } catch (err) {
      console.error(err);
      this.showError("API request failed");
    } finally {
      this.toggleLoading(false);
    }
  }

  changeCategory(category) {
    document.querySelectorAll(".category-btn").forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelector(`[data-category="${category}"]`).classList.add("active");

    this.state.category = category;
    this.state.query = "";
    document.getElementById("newsGrid").innerHTML = "";
    this.loadNews();
  }

  search(query) {
    this.state.query = query;
    document.getElementById("newsGrid").innerHTML = "";
    this.loadNews();
  }

  /* ---------- UI ---------- */
  renderNews(articles) {
    const grid = document.getElementById("newsGrid");
    grid.innerHTML = "";

    articles.forEach(article => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.onclick = () => window.open(article.url, "_blank");

      card.innerHTML = `
        ${article.image
          ? `<img src="${article.image}" class="news-image">`
          : `<div class="news-image default-image">NEWS</div>`}
        <div class="news-content">
          <h3>${article.title}</h3>
          <p>${article.description || ""}</p>
          <div class="news-meta">
            <span>${article.source?.name || "Unknown"}</span>
            <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  toggleLoading(show) {
    document.getElementById("loading").style.display = show ? "block" : "none";
  }

  showError(msg) {
    const el = document.getElementById("error");
    el.style.display = "block";
    el.textContent = msg;
  }
}

document.addEventListener("DOMContentLoaded", () => new NewsApp());
