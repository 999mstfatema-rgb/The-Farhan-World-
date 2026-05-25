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

// Get all published posts
async function getPosts() {
    try {
        const snapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting posts:", error);
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
        console.error("Error getting post:", error);
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
    const posts = await getPosts();
    const counts = { world: 0, politics: 0, business: 0, technology: 0, sports: 0, entertainment: 0 };
    posts.forEach(post => {
        if (counts[post.category] !== undefined) counts[post.category]++;
    });
    return counts;
}

// Get trending posts
async function getTrendingPosts(limit = 5) {
    const posts = await getPosts();
    return posts.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
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
