// ========== SUPABASE CONFIGURATION ==========
const SUPABASE_URL = 'https://hditdeoutpexdsjlwifz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oE-yHn0xup-Srsvod5o4vA_VQ9gezw3';

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function adminLogin(email, password, rememberMe = true) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Error:', error.message);
            return false;
        }
        
        if (data.session) {
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('session', JSON.stringify(data.session));
            if (rememberMe) {
                localStorage.setItem('admin_remembered', 'true');
            }
            return true;
        }
        return false;
    } catch (err) {
        console.error('Error:', err);
        return false;
    }
}

async function adminLogout() {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = 'admin.html';
}

function isAdminLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true';
}

// Rest of the functions remain same...
async function getAllPosts() {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

async function getPublishedPosts() {
    const { data, error } = await supabase.from('posts').select('*').eq('status', 'published').order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

async function getPostsByCategory(category) {
    const { data, error } = await supabase.from('posts').select('*').eq('status', 'published').eq('category', category).order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

async function getPostById(id) {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error) return null;
    return data;
}

async function createPost(postData) {
    const { error } = await supabase.from('posts').insert([{ ...postData, created_at: new Date().toISOString(), views: 0 }]);
    if (error) return false;
    return true;
}

async function updatePost(id, updatedData) {
    const { error } = await supabase.from('posts').update(updatedData).eq('id', id);
    if (error) return false;
    return true;
}

async function deletePost(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) return false;
    return true;
}

async function incrementViews(postId) {
    const post = await getPostById(postId);
    if (post) {
        await supabase.from('posts').update({ views: (post.views || 0) + 1 }).eq('id', postId);
    }
}

async function getCategoryCounts() {
    const posts = await getPublishedPosts();
    const counts = { world: 0, politics: 0, business: 0, technology: 0, sports: 0, entertainment: 0 };
    posts.forEach(post => { if (counts[post.category] !== undefined) counts[post.category]++; });
    return counts;
}

async function getTrendingPosts(limit = 5) {
    const posts = await getPublishedPosts();
    return posts.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
}

async function getBreakingNews() {
    const posts = await getPublishedPosts();
    return posts.slice(0, 5);
}

async function getFeaturedPosts() {
    const posts = await getPublishedPosts();
    return posts.slice(0, 3);
}

async function searchPosts(query) {
    const { data, error } = await supabase.from('posts').select('*').eq('status', 'published').or(`title.ilike.%${query}%,headline.ilike.%${query}%,content.ilike.%${query}%`);
    if (error) return [];
    return data;
}
