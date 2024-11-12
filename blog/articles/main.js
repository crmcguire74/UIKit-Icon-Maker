// configurationuration settings
const configuration = {
  baseUrl: window.location.origin,
  getUrl: function (path) {
    return this.baseUrl + (path.startsWith("/") ? path : "/" + path);
  },
};

// Post Data Management
class PostManager {
  constructor() {
    this.postData = this.loadPostData();
  }

  loadPostData() {
    const postDataElement = document.getElementById("postData");
    if (!postDataElement) {
      console.error("Post data not found");
      return null;
    }
    try {
      return JSON.parse(postDataElement.textContent);
    } catch (error) {
      console.error("Error parsing post data:", error);
      return null;
    }
  }

  updateMetaTags() {
    if (!this.postData) return;

    const metaUpdates = {
      'meta[property="og:title"]': this.postData.title,
      'meta[property="og:description"]': this.postData.description,
      'meta[property="og:url"]': configuration.getUrl(
        `/blog/articles/${this.postData.slug}.html`
      ),
      'meta[property="og:image"]': configuration.getUrl(this.postData.image),
      'meta[name="twitter:title"]': this.postData.title,
      'meta[name="twitter:description"]': this.postData.description,
      'meta[name="twitter:image"]': configuration.getUrl(this.postData.image),
      'link[rel="canonical"]': configuration.getUrl(
        `/blog/articles/${this.postData.slug}.html`
      ),
    };

    Object.entries(metaUpdates).forEach(([selector, value]) => {
      const element = document.querySelector(selector);
      if (element) {
        if (element.hasAttribute("content")) {
          element.setAttribute("content", value);
        } else if (element.hasAttribute("href")) {
          element.setAttribute("href", value);
        }
      }
    });
  }

  updateSchema() {
    if (!this.postData) return;

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": configuration.getUrl(
          `/blog/articles/${this.postData.slug}.html`
        ),
      },
      headline: this.postData.title,
      description: this.postData.description,
      image: configuration.getUrl(this.postData.image),
      author: {
        "@type": "Person",
        name: this.postData.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Icon Forge",
        logo: {
          "@type": "ImageObject",
          url: configuration.getUrl("/images/logo.svg"),
        },
      },
      datePublished: this.postData.datePublished,
      dateModified: this.postData.dateModified,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: this.postData.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: configuration.getUrl(crumb.path),
      })),
    };

    // Update or create schema scripts
    this.updateSchemaScript("blogPosting", blogPostingSchema);
    this.updateSchemaScript("breadcrumbs", breadcrumbSchema);
  }

  updateSchemaScript(id, schema) {
    let script = document.querySelector(`script[data-schema="${id}"]`);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", id);
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
  }
}

// UI Components
class UIManager {
  constructor() {
    this.progressBar = document.querySelector(".progress-bar");
    this.scrollIndicator = document.querySelector(".scroll-indicator-arrow");
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Progress bar
    window.addEventListener("scroll", () => this.updateProgressBar());

    // Scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.addEventListener("click", (e) => {
        e.preventDefault();
        const firstContent = document.querySelector("#keytakeaways");
        if (firstContent) {
          const yOffset = -50; // Adjust this value to control the final scroll position
          const y =
            firstContent.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }
      });
    }

    // TOC links
    const tocLinks = document.querySelectorAll(".toc-link");
    tocLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleTocClick(e);
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  updateProgressBar() {
    if (!this.progressBar) return;

    const winScroll = document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    this.progressBar.style.width = `${scrolled}%`;
  }

  handleTocClick(e) {
    const links = document.querySelectorAll(".toc-link");
    links.forEach((link) => {
      link.classList.toggle("active", link === e.target);
    });
  }
}

// Dark Mode Management
class DarkModeManager {
  constructor() {
    this.checkDarkModePreference();
  }

  toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
  }

  checkDarkModePreference() {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      document.body.classList.add("dark-mode");
    }
  }
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const postManager = new PostManager();
  const uiManager = new UIManager();
  const darkModeManager = new DarkModeManager();

  // Update meta tags and schema
  postManager.updateMetaTags();
  postManager.updateSchema();
});
