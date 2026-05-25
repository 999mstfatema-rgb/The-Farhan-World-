// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = {
    apiKey: "AIzaSyAOKSPMSNaFP167R-uWtvwVegH3exOViRQ",
    authDomain: "the-farhan-world.firebaseapp.com",
    projectId: "the-farhan-world",
    storageBucket: "the-farhan-world.firebasestorage.app",
    messagingSenderId: "753468735885",
    appId: "1:753468735885:web:9081e32ea3efdb2033fdc4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ========== POST FUNCTIONS ==========

// Get ALL posts (without status filter) - for homepage
async function getAllPosts() {
    try {
        const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting all posts:", error);
        return [];
    }
}

// Get published posts only - for filtering
async function getPublishedPosts() {
    try {
        const snapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting published posts:", error);
        return [];
    }
}

// Get posts by category
async function getPostsByCategory(category) {
    try {
        const snapshot = await db.collection('posts').where('status', '==', 'published').where('category', '==', category).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting posts by category:", error);
        return [];
    }
}

// Get single post by ID
async function getPostById(id) {
    try {
        const doc = await db.collection('posts').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("Error getting post by id:", error);
        return null;
    }
}

// Create new post
async function createPost(postData) {
    try {
        await db.collection('posts').add({
            ...postData,
            createdAt: new Date(),
            status: 'published',
            views: 0
        });
        return true;
    } catch (error) {
        console.error("Error creating post:", error);
        return false;
    }
}

// Update post
async function updatePost(id, updatedData) {
    try {
        await db.collection('posts').doc(id).update(updatedData);
        return true;
    } catch (error) {
        console.error("Error updating post:", error);
        return false;
    }
}

// Delete post
async function deletePost(id) {
    try {
        await db.collection('posts').doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting post:", error);
        return false;
    }
}

// Increment view count
async function incrementViews(id) {
    try {
        const post = await getPostById(id);
        if (post) {
            await db.collection('posts').doc(id).update({
                views: (post.views || 0) + 1
            });
        }
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
}

// Get category counts
async function getCategoryCounts() {
    const posts = await getAllPosts();
    const counts = { world: 0, politics: 0, business: 0, technology: 0, sports: 0, entertainment: 0 };
    posts.forEach(post => {
        if (counts[post.category] !== undefined) counts[post.category]++;
    });
    return counts;
}

// Get trending posts (most viewed)
async function getTrendingPosts(limit = 5) {
    const posts = await getAllPosts();
    return posts.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
}

// Search posts
async function searchPosts(query) {
    const posts = await getAllPosts();
    return posts.filter(post => 
        post.headline?.toLowerCase().includes(query.toLowerCase()) ||
        post.title?.toLowerCase().includes(query.toLowerCase()) ||
        post.content?.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(query.toLowerCase())
    );
}

// ========== SOCIAL LINKS ==========
function getSocialLinks() {
    return {
        facebook: localStorage.getItem('social_facebook') || '',
        instagram: localStorage.getItem('social_instagram') || '',
        twitter: localStorage.getItem('social_twitter') || '',
        youtube: localStorage.getItem('social_youtube') || ''
    };
}

function saveSocialLinks(links) {
    Object.keys(links).forEach(key => {
        localStorage.setItem(`social_${key}`, links[key]);
    });
}

// ========== TEST CONNECTION ==========
async function testConnection() {
    try {
        const test = await db.collection('posts').limit(1).get();
        console.log("✅ Firebase connected! Posts found:", test.size);
        return true;
    } catch (error) {
        console.error("❌ Firebase connection error:", error);
        return false;
    }
}
testConnection();
