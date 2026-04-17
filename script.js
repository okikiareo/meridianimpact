// Slider functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".indicator");
let autoSlideInterval;

/**
 * Display the specified slide
 * @param {number} n - Index of the slide to show
 */
function showSlide(n) {
  // Remove active class from current slide
  slides[currentSlide].classList.remove("active");
  indicators[currentSlide].classList.remove("active");

  // Calculate new slide index (with wrapping)
  currentSlide = (n + slides.length) % slides.length;

  // Add active class to new slide
  slides[currentSlide].classList.add("active");
  indicators[currentSlide].classList.add("active");
}

/**
 * Change slide by direction
 * @param {number} direction - Direction to move (-1 for previous, 1 for next)
 */
function changeSlide(direction) {
  showSlide(currentSlide + direction);
  resetAutoSlide();
}

/**
 * Go to a specific slide
 * @param {number} n 
 */
function goToSlide(n) {
  showSlide(n);
  resetAutoSlide();
}


function autoSlide() {
  autoSlideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 3000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlide();
}

autoSlide();

// TOGGLE MENU
function toggleMobileMenu() {
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuToggle = document.querySelector(".mobile-menu-toggle");

  mobileMenu.classList.toggle("active");
  menuToggle.classList.toggle("active");
}

// What We Do Scroll Animation
const wwdSections = document.querySelectorAll(".what-we-do-section");
const wwdWrapper = document.querySelector(".what-we-do-wrapper");

function updateWWDSections() {
  if (!wwdWrapper) return;

  const wrapperTop = wwdWrapper.getBoundingClientRect().top;
  const wrapperHeight = wwdWrapper.offsetHeight;
  const viewportHeight = window.innerHeight;
  const scrollProgress = Math.max(
    0,
    Math.min(1, -wrapperTop / (wrapperHeight - viewportHeight))
  );

  const totalSections = wwdSections.length;

  wwdSections.forEach((section, index) => {
    const sectionStart = index / totalSections;
    const sectionEnd = (index + 1) / totalSections;

    if (scrollProgress >= sectionStart && scrollProgress < sectionEnd) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });

  // Keep last section active when at the end
  if (scrollProgress >= 1) {
    wwdSections[totalSections - 1].classList.add("active");
  }
}

window.addEventListener("scroll", updateWWDSections);
window.addEventListener("load", updateWWDSections);

// Gallery Scroll Functionality
let galleryScrollPosition = 0;
const galleryTrack = document.querySelector('.gallery-track');

function moveGallery(direction) {
    if (!galleryTrack) return;
    
    const itemWidth = 450 + 24; // item width + gap
    const maxScroll = -(galleryTrack.scrollWidth / 2);
    
    galleryScrollPosition += direction * itemWidth * -1;
    
    // Reset position for infinite scroll
    if (galleryScrollPosition < maxScroll) {
        galleryScrollPosition = 0;
    } else if (galleryScrollPosition > 0) {
        galleryScrollPosition = maxScroll;
    }
    
    galleryTrack.style.animation = 'none';
    galleryTrack.style.transform = `translateX(${galleryScrollPosition}px)`;
    
    // Resume animation after manual control
    setTimeout(() => {
        galleryTrack.style.animation = 'scroll 30s linear infinite';
    }, 100);
}

// Duplicate gallery items for seamless infinite scroll
if (galleryTrack) {
    const items = Array.from(galleryTrack.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        galleryTrack.appendChild(clone);
    });
}

// Blog Posts Functionality
async function fetchBlogPosts() {
  try {
      // Fetch all markdown files from the content/blog directory
      const response = await fetch('https://api.github.com/repos/okikiareo/meridianimpact/contents/content/blog');
      const files = await response.json();
      
      // Filter for markdown files only
      const markdownFiles = files.filter(file => file.name.endsWith('.md'));
      
      // Fetch content of each markdown file
      const posts = await Promise.all(
          markdownFiles.map(async (file) => {
              const contentResponse = await fetch(file.download_url);
              const content = await contentResponse.text();
              return parseMarkdownPost(content, file.name);
          })
      );
      
      // Sort by date (newest first)
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return posts;
  } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
  }
}

function parseMarkdownPost(content, filename) {
  // Extract frontmatter (metadata between --- markers)
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const frontmatter = match[1];
  const body = match[2];
  
  // Parse frontmatter fields
  const post = {};
  frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
          const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          post[key.trim()] = value;
      }
  });
  
  post.body = body;
  post.slug = filename.replace('.md', '');
  
  return post;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  });
}

// Display latest 3 posts on homepage
async function displayHomepagePosts() {
  const postsContainer = document.getElementById('homepage-blog-posts');
  if (!postsContainer) return;
  
  const posts = await fetchBlogPosts();
  const latestPosts = posts.slice(0, 3);
  
  if (latestPosts.length === 0) {
      postsContainer.innerHTML = '<p>No blog posts yet.</p>';
      return;
  }
  
  postsContainer.innerHTML = latestPosts.map(post => `
      <article class="blog-card">
          <div class="blog-image">
              <img src="${post.thumbnail || '/img/placeholder.jpg'}" alt="${post.title}">
          </div>
          <div class="blog-content">
              <div class="blog-meta">
                  <span class="blog-date">${formatDate(post.date)}</span>
                  <span class="blog-category">${post.category || 'Uncategorized'}</span>
              </div>
              <h3>${post.title}</h3>
              <p>${post.excerpt || ''}</p>
              <a href="blog-post.html?slug=${post.slug}" class="blog-read-more">Read More →</a>
          </div>
      </article>
  `).join('');
}
