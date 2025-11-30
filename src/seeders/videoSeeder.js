const mongoose = require('mongoose');
const ProductVideo = require('../models/productVideo.model');
require('dotenv').config();

// Sample video data with URLs
const sampleVideos = [
    {
        title: "Elegant Beige Abaya Collection",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/1.mp4?updatedAt=1763378856557",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-1/IMG-20251023-WA0019.jpg?updatedAt=1763378727295",
        productName: "Premium Jersey Abaya",
        price: 7900,
        category: "premium",
        order: 1,
        isActive: true
    },
    {
        title: "Winter Wedding Guest Outfit Ideas",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/2.mp4?updatedAt=1763378855301",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/120.jpg?updatedAt=1763378853176",
        productName: "Luxury Crown Jewel Abaya",
        price: 20000,
        category: "luxury",
        order: 2,
        isActive: true
    },
    {
        title: "Shop the look online",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/3.mp4?updatedAt=1763378856190",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/112.jpg?updatedAt=1763378853043",
        productName: "Casual Daily Wear Abaya",
        price: 6700,
        category: "casual",
        order: 3,
        isActive: true
    },
    {
        title: "Abayas You Don't Want To Regret Missing Out On",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/4.mp4?updatedAt=1763378856267",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-1/IMG-20251023-WA0020.jpg?updatedAt=1763378727733",
        productName: "Essential Everyday Abaya",
        price: 5900,
        category: "essential",
        order: 4,
        isActive: true
    },
    {
        title: "Sit in the company of a beautiful soul",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/5.mp4?updatedAt=1763378856376",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-1/IMG-20251023-WA0012.jpg?updatedAt=1763378727814",
        productName: "Elegant Hijab Set",
        price: 3500,
        category: "hijab",
        order: 5,
        isActive: true
    },
    {
        title: "Ramadan & Eid Party Wear",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/1.mp4?updatedAt=1763378856557",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/106.jpg?updatedAt=1763378852880",
        productName: "Festive Occasion Abaya",
        price: 15700,
        category: "occasion",
        order: 6,
        isActive: true
    },
    {
        title: "Plain Double Chiffon Open Abaya - Navy",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/2.mp4?updatedAt=1763378855301",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/61.jpg?updatedAt=1763378853422",
        productName: "Plain Double Chiffon Abaya",
        price: 6700,
        category: "casual",
        order: 7,
        isActive: true
    },
    {
        title: "Closed Abaya with Front Zip and Attached Hijab",
        videoUrl: "https://ik.imagekit.io/j90xpcrfe/Abaya%20B/Design-3/3.mp4?updatedAt=1763378856190",
        thumbnailUrl: "https://ik.imagekit.io/j90xpcrfe/115.jpg",
        productName: "Zipper Front Abaya with Hijab",
        price: 7300,
        category: "modern",
        order: 8,
        isActive: true
    }
];

async function seedVideos() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing videos (optional - comment out if you want to keep existing)
        await ProductVideo.deleteMany({});
        console.log('Cleared existing videos');

        // Insert sample videos
        const videos = await ProductVideo.insertMany(sampleVideos);
        console.log(`✅ Successfully added ${videos.length} sample videos to database`);

        // Display added videos
        videos.forEach((video, index) => {
            console.log(`\n${index + 1}. ${video.title}`);
            console.log(`   Price: ₹${video.price}`);
            console.log(`   Category: ${video.category}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding videos:', error);
        process.exit(1);
    }
}

// Run the seeder
seedVideos();
