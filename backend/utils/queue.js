/**
 * Calculates the priority score for a patient in the queue.
 * Logic:
 * - Base Points: Urgent = 30, Normal = 10
 * - Wait Points: +1 point for every 1 minute waited since check-in.
 * 
 * @param {Object} patient - The patient document from MongoDB
 * @returns {Number} - The calculated priority score
 */
const calculatePriorityScore = (patient) => {
  if (patient.unit === 'Critical') return 0; // FCFS logic

  let basePoints = 0;
  if (patient.unit === 'OPD-Urgent') basePoints = 30;
  else if (patient.unit === 'Booked') basePoints = 20;
  else if (patient.unit === 'OPD-Normal') basePoints = 10;
  else if (patient.unit === 'Normal') basePoints = 0;

  
  // Calculate minutes waited
  const now = new Date();
  const checkIn = new Date(patient.checkInTime);
  const diffMs = now - checkIn;
  const waitMinutes = Math.floor(diffMs / (1000 * 60));
  
  return basePoints + waitMinutes;
};

/**
 * Sorts an array of patient entries based on their priority score.
 * 
 * @param {Array} patients - Array of patient documents
 * @returns {Array} - The sorted array with scores included
 */
const sortQueue = (patients) => {
  return patients
    .map(p => {
      const patientObj = p.toObject ? p.toObject() : p;
      return {
        ...patientObj,
        priorityScore: calculatePriorityScore(p)
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || new Date(a.checkInTime) - new Date(b.checkInTime));
};

module.exports = {
  calculatePriorityScore,
  sortQueue
};
