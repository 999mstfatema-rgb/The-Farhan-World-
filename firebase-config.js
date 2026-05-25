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

// ========== NO AUTO AUTH CHECK ==========

// ========== POST FUNCTIONS ==========
async function getAllPosts() {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getPublishedPosts() {
    const snapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
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
        console.error('Error:', error);
        return false;
    }
}

async function updatePost(id, updatedData) {
    try {
        await db.collection('posts').doc(id).update(updatedData);
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function deletePost(id) {
    try {
        await db.collection('posts').doc(id).delete();
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
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
