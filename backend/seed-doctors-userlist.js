const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const doctorsData = [
  { spec: 'Dental', name: 'Dr. Nadeesha Silva', age: 38, gender: 'Female', phone: '0712345678', nic: '865432198V', exp: 12, fee: 2000, hospital: 'Colombo Dental Clinic', email: 'nadeesha.silva@gmail.com' },
  { spec: 'Dermatology', name: 'Dr. Sanduni Fernando', age: 40, gender: 'Female', phone: '0759876543', nic: '845566778V', exp: 14, fee: 2800, hospital: 'Lanka Hospitals', email: 'sanduni.fernando@gmail.com' },
  { spec: 'ENT', name: 'Dr. Nimal Jayasinghe', age: 50, gender: 'Male', phone: '0723456789', nic: '730998877V', exp: 22, fee: 3000, hospital: 'Nawaloka Hospital', email: 'nimal.jayasinghe@gmail.com' },
  { spec: 'General Physician', name: 'Dr. Ruwan Wickramasinghe', age: 47, gender: 'Male', phone: '0764567890', nic: '770112233V', exp: 19, fee: 2500, hospital: 'Colombo General Hospital', email: 'ruwan.w@gmail.com' },
  { spec: 'Gynaecology', name: 'Dr. Dilani Perera', age: 42, gender: 'Female', phone: '0785678901', nic: '825566778V', exp: 15, fee: 3200, hospital: 'Durdans Hospital', email: 'dilani.perera@gmail.com' },
  { spec: 'Neurology', name: 'Dr. Pradeep Kumara', age: 49, gender: 'Male', phone: '0776789012', nic: '760998877V', exp: 21, fee: 4000, hospital: 'National Hospital Colombo', email: 'pradeep.k@gmail.com' },
  { spec: 'Oncology', name: 'Dr. Malini Jayawardena', age: 46, gender: 'Female', phone: '0717890123', nic: '785667788V', exp: 18, fee: 3800, hospital: 'Maharagama Cancer Institute', email: 'malini.j@gmail.com' },
  { spec: 'Ophthalmology', name: 'Dr. Saman Wijesinghe', age: 51, gender: 'Male', phone: '0758901234', nic: '740112233V', exp: 24, fee: 3000, hospital: 'Eye Hospital Colombo', email: 'saman.w@gmail.com' },
  { spec: 'Orthopedics', name: 'Dr. Chamara Silva', age: 44, gender: 'Male', phone: '0729012345', nic: '802233445V', exp: 16, fee: 3500, hospital: 'Asiri Hospital', email: 'chamara.s@gmail.com' },
  { spec: 'Pediatrics', name: 'Dr. Ishara Perera', age: 39, gender: 'Female', phone: '0780123456', nic: '865544332V', exp: 12, fee: 2500, hospital: 'Lady Ridgeway Hospital', email: 'ishara.p@gmail.com' },
  { spec: 'Psychiatry', name: 'Dr. Shalini Fernando', age: 41, gender: 'Female', phone: '0771122334', nic: '845566112V', exp: 13, fee: 2700, hospital: 'Colombo South Teaching Hospital', email: 'shalini.f@gmail.com' },
  { spec: 'Radiology', name: 'Dr. Tharindu Senanayake', age: 37, gender: 'Male', phone: '0712233445', nic: '910223344V', exp: 9, fee: 2600, hospital: 'Lanka Hospitals', email: 'tharindu.s@gmail.com' },
  { spec: 'Cardiology', name: 'Dr. Anidu Pathirana', age: 50, gender: 'Male', phone: '0763344556', nic: '730987654V', exp: 22, fee: 4200, hospital: 'Lanka Hospitals', email: 'anidu.p@gmail.com' },
  { spec: 'Dental', name: 'Dr. Kasuni Rodrigo', age: 36, gender: 'Female', phone: '0754455667', nic: '905566778V', exp: 10, fee: 1800, hospital: 'Smile Care Dental', email: 'kasuni.r@gmail.com' },
  { spec: 'Dermatology', name: 'Dr. Hiruni De Silva', age: 35, gender: 'Female', phone: '0785566778', nic: '925566778V', exp: 8, fee: 2400, hospital: 'Skin Clinic Colombo', email: 'hiruni.d@gmail.com' },
  { spec: 'ENT', name: 'Dr. Sunil Karunaratne', age: 53, gender: 'Male', phone: '0726677889', nic: '720334455V', exp: 27, fee: 3200, hospital: 'Nawaloka Hospital', email: 'sunil.k@gmail.com' },
  { spec: 'Orthopedics', name: 'Dr. Kasun Perera', age: 38, gender: 'Male', phone: '0777788990', nic: '900112233V', exp: 11, fee: 3000, hospital: 'Asiri Hospital', email: 'kasun.p@gmail.com' },
  { spec: 'Pediatrics', name: 'Dr. Nadeeja Seneviratne', age: 42, gender: 'Female', phone: '0718899001', nic: '805678912V', exp: 15, fee: 2600, hospital: 'Lady Ridgeway Hospital', email: 'nadeeja.s@gmail.com' },
  { spec: 'Neurology', name: 'Dr. Ramesh Fernando', age: 48, gender: 'Male', phone: '0769900112', nic: '780123456V', exp: 20, fee: 3900, hospital: 'National Hospital Colombo', email: 'ramesh.f@gmail.com' }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const d of doctorsData) {
      // 1. Check if user already exists
      let user = await User.findOne({ email: d.email });
      
      if (!user) {
        user = new User({
          name: d.name,
          email: d.email,
          password: 'Doc@123',
          phone: d.phone,
          nic: d.nic,
          role: 'DOCTOR',
          status: 'active',
          age: d.age,
          gender: d.gender
        });
        await user.save();
      }

      // 2. Check if doctor profile already exists
      const existingDoc = await Doctor.findOne({ user: user._id });
      if (!existingDoc) {
        const doctor = new Doctor({
          user: user._id,
          experienceYears: d.exp,
          specialization: d.spec,
          consultantFee: d.fee,
          primaryHospital: d.hospital
        });
        await doctor.save();
        console.log(`👨‍⚕️ Added: ${d.name} (${d.spec})`);
      } else {
        console.log(`⏭️  Skipped: ${d.name} (Already exists)`);
      }
    }

    console.log('\n🎉 Doctor seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding doctors:', err);
    process.exit(1);
  }
};

seedDoctors();
