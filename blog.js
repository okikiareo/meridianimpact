
// Display all posts on blog page
async function displayAllPosts() {
    const postsContainer = document.getElementById('all-blog-posts');
    if (!postsContainer) return;
    
    const posts = await fetchBlogPosts();
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No blog posts yet.</p>';
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
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
  
  // Initialize blog displays
  document.addEventListener('DOMContentLoaded', () => {
    displayHomepagePosts();
    displayAllPosts();
  });
  
  
  // Single Blog Post Functionality
  async function displaySinglePost() {
    // Check if we're on the blog post page
    if (!document.getElementById('post-content')) return;
    
    // Get slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        showPostError();
        return;
    }
    
    try {
        // Fetch the specific blog post
        const response = await fetch(`https://api.github.com/repos/okikiareo/meridianimpact/contents/content/blog/${slug}.md`);
        
        if (!response.ok) {
            showPostError();
            return;
        }
        
        const fileData = await response.json();
        const contentResponse = await fetch(fileData.download_url);
        const content = await contentResponse.text();
        const post = parseMarkdownPost(content, `${slug}.md`);
        
        if (!post) {
            showPostError();
            return;
        }
        
        // Update page title
        document.title = `${post.title} - Meridian Impact`;
        
        // Display post content
        document.getElementById('post-loading').style.display = 'none';
        document.getElementById('post-content').style.display = 'block';
        
        document.getElementById('breadcrumb-title').textContent = post.title;
        document.getElementById('post-category').textContent = post.category || 'Uncategorized';
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-author').textContent = `By ${post.author}`;
        document.getElementById('post-date').textContent = formatDate(post.date);
        document.getElementById('post-image').src = post.thumbnail || '/img/placeholder.jpg';
        document.getElementById('post-image').alt = post.title;
        
        // Convert markdown to HTML
        document.getElementById('post-body').innerHTML = marked.parse(post.body);
        
        // Setup share buttons
        const pageUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(post.title);
        
        document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
        document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
        document.getElementById('share-linkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
        document.getElementById('share-whatsapp').href = `https://wa.me/?text=${pageTitle}%20${pageUrl}`;
    } catch (error) {
        console.error('Error loading post:', error);
        showPostError();
    }
  }
  
  function showPostError() {
    document.getElementById('post-loading').style.display = 'none';
    document.getElementById('post-error').style.display = 'block';
  }
  
  // Update DOMContentLoaded to include single post
  document.addEventListener('DOMContentLoaded', () => {
    displayHomepagePosts();
    displayAllPosts();
    displaySinglePost(); // Add this
  });