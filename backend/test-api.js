const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  const specRes = await fetch('http://localhost:5000/api/schedule/specializations');
  const specs = await specRes.json();
  console.log('Specializations:', specs);
  
  if (specs.length > 0) {
    const docRes = await fetch(`http://localhost:5000/api/doctors/specialization/${specs[0]}`);
    const docs = await docRes.json();
    console.log('Doctors for', specs[0], ':', JSON.stringify(docs[0], null, 2));
    
    if (docs.length > 0) {
      const docId = docs[0].id || docs[0]._id;
      console.log('Using Doc ID:', docId);
      const availRes = await fetch(`http://localhost:5000/api/schedule/available?doctorId=${docId}`);
      const avails = await availRes.json();
      console.log('Available sessions count:', avails.length);
    }
  }
}
test();
