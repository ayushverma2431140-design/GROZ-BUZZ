class NewsApp {
  constructor() {
    this.API_KEY = "8dbaacd25d6c31a6aee6f80ca8394805";
    this.BASE_URL = "https://gnews.io/api/v4";

    this.state = {
      category: "general",
      query: "",
      page: 1,
      pageSize: 9,
      articles: [],
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

    const icon = document.getElementById("themeIcon");
    icon.textContent = theme === "dark" ? "☀️" : "🌙";

    document.getElementById("themeToggle").onclick = () => {
      const next = theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      location.reload();
    };
  }

  /* ---------- EVENTS ---------- */
  setupEvents() {
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.addEventListener("click", () => this.changeCategory(btn.dataset.category));
    });

    const searchInput = document.getElementById("searchInput");
    let debounce;

    searchInput.addEventListener("input", e => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.search(e.target.value.trim());
      }, 500);
    });

    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500 &&
        !this.state.loading
      ) {
        this.loadMore();
      }
    });

    document.addEventListener("click", e => {
      const card = e.target.closest(".news-card");
      if (card?.dataset.url) {
        window.open(card.dataset.url, "_blank");
      }
    });
  }

  /* ---------- API ---------- */
  buildUrl() {
    const params = new URLSearchParams({
      token: this.API_KEY,
      lang: "en",
      max: this.state.pageSize,
      page: this.state.page
    });

    if (this.state.query) {
      params.append("q", this.state.query);
    } else {
      params.append("topic", this.state.category);
    }

    return `${this.BASE_URL}/top-headlines?${params}`;
  }

  async loadNews() {
    this.state.loading = true;
    this.toggleLoading(true);

    try {
      const res = await fetch(this.buildUrl());
      const data = await res.json();

      if (!data.articles || data.articles.length === 0) {
        this.showError("No news found");
        return;
      }

      this.state.articles = data.articles;
      this.renderNews(data.articles);
    } catch (err) {
      this.showError("Failed to load news");
      console.error(err);
    } finally {
      this.toggleLoading(false);
      this.state.loading = false;
    }
  }

  async loadMore() {
    this.state.page++;
    this.loadNews();
  }

  changeCategory(category) {
    document.querySelectorAll(".category-btn").forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelector(`[data-category="${category}"]`).classList.add("active");

    this.state.category = category;
    this.state.query = "";
    this.state.page = 1;
    document.getElementById("newsGrid").innerHTML = "";
    this.loadNews();
  }

  search(query) {
    this.state.query = query;
    this.state.page = 1;
    document.getElementById("newsGrid").innerHTML = "";
    this.loadNews();
  }

  /* ---------- UI ---------- */
  renderNews(articles) {
    const grid = document.getElementById("newsGrid");

    articles.forEach(article => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.dataset.url = article.url;

      const image = article.image
        ? `<img src="${article.image}" class="news-image">`
        : `<div class="news-image default-image">NEWS</div>`;

      card.innerHTML = `
        ${image}
        <div class="news-content">
          <h3>${article.title}</h3>
          <p>${article.description || "No description available."}</p>
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
    el.textContent = msg;
    el.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => new NewsApp());
