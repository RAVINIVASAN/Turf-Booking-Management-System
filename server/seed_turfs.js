const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Turf = require('./models/Turf');

// Load environment variables
dotenv.config();

const turfs = [
  {
    name: "Green Park Turf",
    description: "Premium grass turf in Mylapore with professional lighting",
    location: "Mylapore, Chennai",
    latitude: 13.0349,
    longitude: 80.2603,
    priceSlots: { morning: 500, afternoon: 700, evening: 1000 },
    phoneNumber: "9876543210",
    email: "greenpark@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking"]
  },
  {
    name: "Elite Sports Ground",
    description: "International standard football ground in Velachery",
    location: "Velachery, Chennai",
    latitude: 13.0011,
    longitude: 80.2127,
    priceSlots: { morning: 600, afternoon: 800, evening: 1200 },
    phoneNumber: "9876543211",
    email: "elite@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking", "Equipment"]
  },
  {
    name: "Shanthi Turf Academy",
    description: "Best coaching academy with professional ground",
    location: "Thambaram, Chennai",
    latitude: 12.9352,
    longitude: 80.2245,
    priceSlots: { morning: 450, afternoon: 650, evening: 900 },
    phoneNumber: "9876543212",
    email: "shanthi@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking", "Coaching"]
  },
  {
    name: "Champions League FC",
    description: "State-of-the-art turf with LED lights",
    location: "Nungambakkam, Chennai",
    latitude: 13.0494,
    longitude: 80.2308,
    priceSlots: { morning: 700, afternoon: 900, evening: 1300 },
    phoneNumber: "9876543213",
    email: "champions@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking", "Bar"]
  },
  {
    name: "Riverside Sports Complex",
    description: "Multi-sport facility with professional turf",
    location: "Adyar, Chennai",
    latitude: 13.0045,
    longitude: 80.2624,
    priceSlots: { morning: 550, afternoon: 750, evening: 1050 },
    phoneNumber: "9876543214",
    email: "riverside@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking", "Swimming"]
  },
  {
    name: "Victory Park Turf",
    description: "Community turf ground with excellent facilities",
    location: "Besant Nagar, Chennai",
    latitude: 13.0061,
    longitude: 80.2714,
    priceSlots: { morning: 400, afternoon: 600, evening: 800 },
    phoneNumber: "9876543215",
    email: "victory@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking"]
  },
  {
    name: "Star Football Club",
    description: "Premium football facility with international standards",
    location: "T Nagar, Chennai",
    latitude: 13.0336,
    longitude: 80.2462,
    priceSlots: { morning: 650, afternoon: 850, evening: 1150 },
    phoneNumber: "9876543216",
    email: "star@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking", "Gym"]
  },
  {
    name: "Sunset Sports Grounds",
    description: "Scenic turf with evening practice facilities",
    location: "Alwarpet, Chennai",
    latitude: 13.0159,
    longitude: 80.2498,
    priceSlots: { morning: 500, afternoon: 700, evening: 1100 },
    phoneNumber: "9876543217",
    email: "sunset@turf.com",
    amenities: ["Lighting", "Washrooms", "Parking"]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected');

    // Delete existing turfs
    const deleteResult = await Turf.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing turfs`);

    // Insert new turfs
    const result = await Turf.insertMany(turfs);
    console.log(`\n✅ Successfully created ${result.length} turfs!`);

    result.forEach((turf) => {
      console.log(`   ✓ ${turf.name} (${turf.latitude}, ${turf.longitude})`);
    });

    // Verify
    const count = await Turf.countDocuments();
    console.log(`\n📊 Total turfs in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
