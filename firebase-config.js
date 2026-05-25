// Firebase Configuration
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

// Get all published posts
async function getPosts() {
    try {
        const snapshot = await db.collection('posts').where('status', '==', 'published').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

// Create post
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
        console.error("Error:", error);
        return false;
    }
}

// Delete post
async function deletePost(id) {
    try {
        await db.collection('posts').doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}

// Social links
function getSocialLinks() {
    return {
        facebook: localStorage.getItem('social_facebook') || '',
        instagram: localStorage.getItem('social_instagram') || '',
        twitter: localStorage.getItem('social_twitter') || '',
        youtube: localStorage.getItem('social_youtube') || ''
    };
}

function saveSocialLinks(links) {
    Object.keys(links).forEach(key => localStorage.setItem(`social_${key}`, links[key]));
}

console.log("Firebase loaded");
