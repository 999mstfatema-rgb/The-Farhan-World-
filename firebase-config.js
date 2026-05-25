// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = {
    apiKey: "AIzaSyAOKSPMSNaFP167R-uWtvwVegH3exOViRQ",
    authDomain: "the-farhan-world.firebaseapp.com",
    projectId: "the-farhan-world",
    storageBucket: "the-farhan-world.firebasestorage.app",
    messagingSenderId: "753468735885",
    appId: "1:753468735885:web:9081e32ea3efdb2033fdc4",
    measurementId: "G-J5J35N4CNT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ========== ADMIN CREDENTIALS ==========
const ADMIN_EMAIL = '999farhanislam@gmail.com';
const ADMIN_PASSWORD = '@#$SaGoR@#$1';

// ========== POST FUNCTIONS ==========

async function getAllPosts() {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPublishedPosts() {
    const snapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPostsByCategory(category) {
    const snapshot = await db.collection('posts').where('status', '==', 'published').where('category', '==', category).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPostById(id) {
    const doc = await db.collection('posts').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

async function createPost(postData) {
    try {
        await db.collection('posts').add({
            ...postData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            views: 0
        });
        return true;
    } catch (error) {
        console.error('Error creating post:', error);
        return false;
    }
}

async function updatePost(id, updatedData) {
    try {
        await db.collection('posts').doc(id).update(updatedData);
        return true;
    } catch (error) {
        console.error('Error updating post:', error);
        return false;
    }
}

async function deletePost(id) {
    try {
        await db.collection('posts').doc(id).delete();
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        return false;
    }
}

async function incrementViews(id) {
    const post = await getPostById(id);
    if (post) {
        await db.collection('posts').doc(id).update({
            views: (post.views || 0) + 1
        });
    }
}

async function getCategoryCounts() {
    const posts = await getPublishedPosts();
    const counts = { world: 0, politics: 0, business: 0, technology: 0, sports: 0, entertainment: 0 };
    posts.forEach(post => {
        if (counts[post.category] !== undefined) counts[post.category]++;
    });
    return counts;
}

async function getTrendingPosts(limit = 5) {
    const posts = await getPublishedPosts();
    return posts.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
}

async function searchPosts(query) {
    const posts = await getPublishedPosts();
    return posts.filter(post => 
        post.headline.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
    );
}

// ========== ADMIN AUTH ==========
async function adminLogin(email, password, remember = true) {
    try {
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return false;
        }
        await auth.signInWithEmailAndPassword(email, password);
        localStorage.setItem('admin_logged_in', 'true');
        if (remember) {
            localStorage.setItem('admin_remembered', 'true');
        }
        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

function isAdminLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true';
}

async function adminLogout() {
    await auth.signOut();
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_remembered');
    window.location.href = 'admin.html';
}

auth.onAuthStateChanged((user) => {
    if (user && user.email === ADMIN_EMAIL) {
        localStorage.setItem('admin_logged_in', 'true');
    } else {
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('create-post.html') ||
            window.location.pathname.includes('edit-post.html')) {
            window.location.href = 'admin.html';
        }
    }
});

// ========== SOCIAL LINKS ==========
function getSocialLinks() {
    return {
        facebook: localStorage.getItem('social_facebook') || '',
        instagram: localStorage.getItem('social_instagram') || '',
        twitter: localStorage.getItem('social_twitter') || '',
        whatsapp: localStorage.getItem('social_whatsapp') || '',
        youtube: localStorage.getItem('social_youtube') || ''
    };
}

function saveSocialLinks(links) {
    Object.keys(links).forEach(key => {
        localStorage.setItem(`social_${key}`, links[key]);
    });
}
