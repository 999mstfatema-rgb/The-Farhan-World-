// Load all content on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadLiveTicker();
    await loadTopStoriesStrip();
    await loadHeroPosts();
    await loadLatestNews();
    await loadTrendingPosts();
    await updateCategoryCounts();
    updateDateTime();
    
    setInterval(updateDateTime, 1000);
    
    // Search functionality
    const searchToggle = document.getElementById('searchToggle');
    const searchBar = document.getElementById('searchBar');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchBar.classList.toggle('active');
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (query) await performSearch(query);
        });
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            if (filter === 'all') await loadLatestNews();
            else await filterPostsByCategory(filter);
        });
    });
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input').value;
            alert(`Thank you for subscribing! Updates will be sent to ${email}`);
            newsletterForm.reset();
        });
    }
    
    // Load more
    let currentPage = 1;
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            currentPage++;
            await loadMorePosts(currentPage);
        });
    }
});

function updateDateTime() {
    const dtElem = document.getElementById('currentDateTime');
    if (dtElem) {
        const now = new Date();
        dtElem.innerHTML = now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}

async function loadLiveTicker() {
    const breaking = await getBreakingNews();
    const ticker = document.getElementById('liveTicker');
    if (ticker) {
        ticker.innerHTML = breaking.map(news => `<span>🔥 ${news.headline || news.title}</span>`).join('');
    }
}

async function loadTopStoriesStrip() {
    const posts = await getPublishedPosts();
    const strip = document.getElementById('topStoriesStrip');
    if (strip) {
        strip.innerHTML = posts.slice(0, 10).map(post => {
            return `<a href="single.html?id=${post.id}">${post.headline || post.title}</a>`;
        }).join('');
    }
}

async function loadHeroPosts() {
    const featured = await getFeaturedPosts();
    const heroGrid = document.getElementById('heroGrid');
    if (heroGrid && featured.length > 0) {
        const mainPost = featured[0];
        const sidePosts = featured.slice(1, 3);
        
        heroGrid.innerHTML = `
            <div class="hero-main">
                <img src="${mainPost.image}" alt="${mainPost.headline || mainPost.title}">
                <div class="hero-content">
                    <span class="hero-category">${mainPost.category.toUpperCase()}</span>
                    <h2><a href="single.html?id=${mainPost.id}">${mainPost.headline || mainPost.title}</a></h2>
                    <p>${(mainPost.excerpt || '').substring(0, 120)}...</p>
                </div>
            </div>
            <div class="hero-side">
                ${sidePosts.map(post => `
                    <div class="hero-side-item">
                        <span class="hero-category">${post.category}</span>
                        <h3><a href="single.html?id=${post.id}">${post.headline || post.title}</a></h3>
                        <small>${new Date(post.created_at).toLocaleDateString()}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

let allPosts = [];
let currentFilter = 'all';

async function loadLatestNews() {
    allPosts = await getPublishedPosts();
    displayPosts(allPosts.slice(0, 6));
}

function displayPosts(posts) {
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
        if (posts.length === 0) {
            newsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No posts found.</p>';
            return;
        }
        
        newsGrid.innerHTML = posts.map(post => `
            <div class="news-card">
                <img src="${post.image}" alt="${post.headline || post.title}">
                <div class="news-card-content">
                    <span class="news-category">${post.category}</span>
                    <h3><a href="single.html?id=${post.id}">${post.headline || post.title}</a></h3>
                    ${post.caption ? `<p class="image-caption" style="font-size:12px; color:#666; margin:5px 0;">${post.caption}</p>` : ''}
                    <div class="news-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString()}</span>
                        <span><i class="fas fa-eye"></i> ${post.views || 0} views</span>
                    </div>
                    <p>${(post.excerpt || '').substring(0, 100)}...</p>
                </div>
            </div>
        `).join('');
    }
}

async function filterPostsByCategory(category) {
    currentFilter = category;
    const filtered = await getPostsByCategory(category);
    displayPosts(filtered.slice(0, 6));
    const loadMoreBtn = document.querySelector('.load-more');
    if (loadMoreBtn) loadMoreBtn.style.display = filtered.length > 6 ? 'block' : 'none';
}

async function loadMorePosts(page) {
    let postsToShow = currentFilter === 'all' ? allPosts : await getPostsByCategory(currentFilter);
    const start = page * 6;
    const newPosts = postsToShow.slice(start, start + 6);
    if (newPosts.length > 0) {
        const newsGrid = document.getElementById('newsGrid');
        newPosts.forEach(post => {
            newsGrid.innerHTML += `
                <div class="news-card">
                    <img src="${post.image}" alt="${post.headline || post.title}">
                    <div class="news-card-content">
                        <span class="news-category">${post.category}</span>
                        <h3><a href="single.html?id=${post.id}">${post.headline || post.title}</a></h3>
                        <div class="news-meta">${new Date(post.created_at).toLocaleDateString()}</div>
                        <p>${(post.excerpt || '').substring(0, 100)}...</p>
                    </div>
                </div>
            `;
        });
    } else {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
}

async function loadTrendingPosts() {
    const trending = await getTrendingPosts(5);
    const trendingList = document.getElementById('trendingList');
    if (trendingList) {
        trendingList.innerHTML = trending.map(post => `
            <li><a href="single.html?id=${post.id}"><i class="fas fa-chart-line"></i> ${post.headline || post.title}</a></li>
        `).join('');
    }
}

async function updateCategoryCounts() {
    const counts = await getCategoryCounts();
    const elements = { worldCount: counts.world, politicsCount: counts.politics, businessCount: counts.business, techCount: counts.technology, sportsCount: counts.sports, entertainmentCount: counts.entertainment };
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

async function performSearch(query) {
    const results = await searchPosts(query);
    displayPosts(results);
}
