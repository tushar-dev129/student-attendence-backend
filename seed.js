const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Subject = require('./models/Subject');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const courses = [
  {
    name: 'Computer Science',
    code: 'CS',
    description: 'High-performance computing, algorithms, and advanced software engineering.',
    duration: 4
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Design and manufacturing of mechanical systems and industrial machinery.',
    duration: 4
  },
  {
    name: 'Business Administration',
    code: 'BBA',
    description: 'Strategic management, financial accounting, and global marketing operations.',
    duration: 3
  },
  {
    name: 'Literature',
    code: 'BA-LIT',
    description: 'Analysis of classical and contemporary world literature and creative writing.',
    duration: 3
  }
];

const subjects = {
  'CS': [
    { name: 'Data Structures', code: 'CS101', description: 'Advanced organization and manipulation of data.' },
    { name: 'Operating Systems', code: 'CS102', description: 'Core principles of OS architecture and kernel design.' },
    { name: 'Artificial Intelligence', code: 'CS103', description: 'Machine learning, neural networks, and problem solving.' },
    { name: 'Cloud Computing', code: 'CS104', description: 'Distributed systems and scalable infrastructure.' }
  ],
  'ME': [
    { name: 'Thermodynamics', code: 'ME101', description: 'Principles of heat, energy, and work conversions.' },
    { name: 'Fluid Mechanics', code: 'ME201', description: 'Study of fluids at rest and in motion.' },
    { name: 'Machine Design', code: 'ME301', description: 'Designing mechanical components for specific roles.' },
    { name: 'Robotics', code: 'ME401', description: 'Integrated design of robotic systems.' }
  ],
  'BBA': [
    { name: 'Economics', code: 'BBA101', description: 'Macro and micro-economic principles for business.' },
    { name: 'Financial Accounting', code: 'BBA102', description: 'Methods of tracking and reporting financial status.' },
    { name: 'Business Ethics', code: 'BBA103', description: 'Moral dilemmas and integrity in the corporate world.' },
    { name: 'Marketing Strategy', code: 'BBA104', description: 'Advanced brand building and consumer behavior.' }
  ],
  'BA-LIT': [
    { name: 'Modern Poetry', code: 'LIT101', description: 'Analysis of 20th and 21st-century poetic forms.' },
    { name: 'Shakespearean Studies', code: 'LIT201', description: 'Deep dive into the works of William Shakespeare.' },
    { name: 'Creative Writing', code: 'LIT301', description: 'Developing original narrative and poetic voices.' },
    { name: 'World Mythology', code: 'LIT401', description: 'Study of myths from cultures across the globe.' }
  ]
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('--- Connected to Database ---');

    // Clear existing data (optional, but keeps it clean)
    await Course.deleteMany();
    await Subject.deleteMany();
    console.log('Cleared existing Courses and Subjects.');

    for (const cData of courses) {
      const course = await Course.create(cData);
      console.log(`Created Course: ${course.name} (${course.code})`);

      const courseSubjects = subjects[cData.code].map(s => ({
        ...s,
        courseId: course._id
      }));

      await Subject.insertMany(courseSubjects);
      console.log(`   Added ${courseSubjects.length} subjects to ${course.name}`);
    }

    console.log('--- Seeding Completed Successfully ---');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
