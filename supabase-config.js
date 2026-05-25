// ========== SUPABASE CONFIGURATION ==========
const SUPABASE_URL = 'https://hditdeoutpexdsjlwifz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oE-yHn0xup-Srsvod5o4vA_VQ9gezw3';

// Initialize Supabase client with persistence
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storageKey: 'farhan_auth_token',
        storage: localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Check if user is logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    const remembered = localStorage.getItem('admin_remembered') === 'true';
    
    if (session && remembered) {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('session', JSON.stringify(session));
        return true;
    }
    return false;
}

// Admin login function with remember me
async function adminLogin(email, password, rememberMe = true) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (!error && data.session) {
            if (rememberMe) {
                localStorage.setItem('admin_remembered', 'true');
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                localStorage.setItem('admin_expiry', expiryDate.toISOString());
            } else {
                localStorage.setItem('admin_remembered', 'false');
            }
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('session', JSON.stringify(data.session));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Check if session is expired
function isSessionExpired() {
    const expiry = localStorage.getItem('admin_expiry');
    if (!expiry) return true;
    return new Date() > new Date(expiry);
}

// Admin logout
async function adminLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('session');
    localStorage.removeItem('admin_remembered');
    localStorage.removeItem('admin_expiry');
    window.location.href = 'admin.html';
}

// Check if admin is logged in
function isAdminLoggedIn() {
    const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
    const expired = isSessionExpired();
    if (loggedIn && !expired) return true;
    if (expired) {
        adminLogout();
        return false;
    }
    return false;
}

// Get all posts
async function getAllPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return data;
}

// Get published posts only
async function getPublishedPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
}

// Get posts by category
async function getPostsByCategory(category) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
}

// Get single post
async function getPostById(id) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) return null;
    return data;
}

// Create new post
async function createPost(postData) {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session) return false;
    
    const { data, error } = await supabase
        .from('posts')
        .insert([{
            ...postData,
            created_at: new Date().toISOString(),
            views: 0
        }])
        .select();
    
    if (error) {
        console.error('Error creating post:', error);
        return false;
    }
    return true;
}

// Update post
async function updatePost(id, updatedData) {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session) return false;
    
    const { data, error } = await supabase
        .from('posts')
        .update(updatedData)
        .eq('id', id)
        .select();
    
    if (error) return false;
    return true;
}

// Delete post
async function deletePost(id) {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session) return false;
    
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
    
    if (error) return false;
    return true;
}

// Increment post views
async function incrementViews(postId) {
    const post = await getPostById(postId);
    if (post) {
        await supabase
            .from('posts')
            .update({ views: (post.views || 0) + 1 })
            .eq('id', postId);
    }
}

// Get category counts
async function getCategoryCounts() {
    const posts = await getPublishedPosts();
    const counts = { world: 0, politics: 0, business: 0, technology: 0, sports: 0, entertainment: 0 };
    posts.forEach(post => {
        if (counts[post.category] !== undefined) counts[post.category]++;
    });
    return counts;
}

// Get trending posts
async function getTrendingPosts(limit = 5) {
    const posts = await getPublishedPosts();
    return posts.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
}

// Get breaking news
async function getBreakingNews() {
    const posts = await getPublishedPosts();
    return posts.slice(0, 5);
}

// Get featured posts
async function getFeaturedPosts() {
    const posts = await getPublishedPosts();
    return posts.slice(0, 3);
}

// Search posts
async function searchPosts(query) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,headline.ilike.%${query}%,content.ilike.%${query}%`);
    
    if (error) return [];
    return data;
}

// Contact info functions
function getContactInfo() {
    return {
        email: localStorage.getItem('farhan_contact_email') || 'info@thefarhanworld.com',
        phone: localStorage.getItem('farhan_contact_phone') || '+880 1234 567890',
        address: localStorage.getItem('farhan_contact_address') || 'Dhaka, Bangladesh'
    };
}

function saveContactInfo(email, phone, address) {
    localStorage.setItem('farhan_contact_email', email);
    localStorage.setItem('farhan_contact_phone', phone);
    localStorage.setItem('farhan_contact_address', address);
}

// About content functions
function getAboutContent() {
    return localStorage.getItem('farhan_about_content') || `
        <h2>Welcome to The Farhan World</h2>
        <p>The Farhan World is a premier news organization dedicated to delivering accurate, fast, and comprehensive news coverage from around the globe.</p>
        <h3>Our Mission</h3>
        <p>To inform, inspire, and empower our audience with truth and integrity.</p>
        <h3>Our Team</h3>
        <p>We are a diverse team of experienced journalists, editors, and media professionals committed to excellence in reporting.</p>
    `;
}

function saveAboutContent(content) {
    localStorage.setItem('farhan_about_content', content);
}
