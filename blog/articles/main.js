// Configuration settings
const config = {
  baseUrl: window.location.origin,
  getUrl: function (path) {
    return this.baseUrl + path;
  },
};

// DOM Elements
const progressBar = document.querySelector(".progress-bar");
const scrollIndicator = document.querySelector(
  ".scroll-indicator-arrow, .scroll-indicator-mouse"
);

// Scroll Progress Handler
function updateProgressBar() {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + "%";
}

// Smooth Scroll Handler
function smoothScroll(targetPosition) {
  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
}

// Table of Contents Link Handler
function handleTocClick(e) {
  const links = document.querySelectorAll(".toc-link");
  links.forEach((link) => {
    if (link === e.target) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Initialize Functionality
function initializePage() {
  // Add scroll event listener for progress bar
  window.addEventListener("scroll", updateProgressBar);

  // Add click handler for scroll indicator
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      smoothScroll(window.innerHeight);
    });
  }

  // Add click handlers for ToC links
  const tocLinks = document.querySelectorAll(".toc-link");
  tocLinks.forEach((link) => {
    link.addEventListener("click", handleTocClick);
  });

  // Handle URL configuration for links
  document.addEventListener("DOMContentLoaded", function () {
    if (window.config && window.config.baseUrl) {
      // Update meta tags
      const metaTags = {
        'meta[property="og:url"]':
          "/blog/articles/User_Interface_Design_for_Web_Applications.html",
        'meta[property="og:image"]': "/images/IconForgePreview.png",
        'meta[name="twitter:image"]': "/images/IconForgePreview.png",
        'link[rel="canonical"]':
          "/blog/articles/User_Interface_Design_for_Web_Applications.html",
      };

      // Update meta tags safely
      Object.entries(metaTags).forEach(([selector, path]) => {
        const element = document.querySelector(selector);
        if (element) {
          if (element.hasAttribute("content")) {
            element.content = config.getUrl(path);
          } else if (element.hasAttribute("href")) {
            element.href = config.getUrl(path);
          }
        }
      });

      // Update JSON-LD schema URLs
      const schemas = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      schemas.forEach((schema) => {
        try {
          const data = JSON.parse(schema.innerHTML);

          // Helper function to ensure correct URL format
          const formatUrl = (url) => {
            if (url && !url.startsWith("http")) {
              return config.getUrl(url.startsWith("/") ? url : "/" + url);
            }
            return url;
          };

          // Update various URLs based on schema type
          if (data["@type"] === "BlogPosting") {
            if (data.publisher?.url) {
              data.publisher.url = formatUrl(data.publisher.url);
            }
            if (data.publisher?.logo) {
              data.publisher.logo = formatUrl(
                data.publisher.logo.replace("../", "/")
              );
            }
            if (data.mainEntityOfPage?.["@id"]) {
              data.mainEntityOfPage["@id"] = formatUrl(
                data.mainEntityOfPage["@id"]
              );
            }
          } else {
            // Handle Organization and BreadcrumbList schemas
            if (data.url) {
              data.url = formatUrl(data.url);
            }
            if (data.logo) {
              data.logo = formatUrl(data.logo.replace("../", "/"));
            }
            if (data.itemListElement) {
              data.itemListElement.forEach((item) => {
                if (item.item) {
                  item.item = formatUrl(item.item);
                }
              });
            }
          }

          schema.innerHTML = JSON.stringify(data, null, 2);
        } catch (error) {
          console.error("Error updating schema:", error);
        }
      });
    }
  });
}

// Optional Dark Mode Toggle (if needed)
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
}

// Check for saved dark mode preference
function checkDarkModePreference() {
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode === "true") {
    document.body.classList.add("dark-mode");
  }
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
  checkDarkModePreference();
});
