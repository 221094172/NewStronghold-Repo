import { db, collection, getDocs } from '../firebase-config.js';

// Implement your counts of each section(page), with javascript here/ this part acts as a calculation logic
export async function renderDashboard() {
  const [employeesCount, departmentsCount, servicesCount, purchaseOrdersCount] = await Promise.all([
    getCollectionCount('employees'),
    getCollectionCount('departments'),
    getCollectionCount('services'),
    getCollectionCount('purchase_orders')
  ]);
// You return your count collections into your cards, this is a return function
  return `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome to Stronghold Tech Security System</p>
      <div class="mission-container">
        <p>"At STS, our mission is to provide intelligent, reliable, and intergrated security solutions that protect people, property, and businesses. We are committed to combining cutting-edge technology with profesional expertise to deliver smart surveillance, rapid response, and peace of mind to every client we serve".</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Employees</h3>
        <div class="stat-value">${employeesCount}</div>
      </div>
      <div class="stat-card">
        <h3>Total Departments</h3>
        <div class="stat-value">${departmentsCount}</div>
      </div>
      <div class="stat-card">
        <h3>Total Services</h3>
        <div class="stat-value">${servicesCount}</div>
      </div>
      <div class="stat-card">
        <h3>Purchase Orders</h3>
        <div class="stat-value">${purchaseOrdersCount}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>System Overview</h2>
      </div>
      <p>This security management system helps you manage employees, departments, services, and purchase orders efficiently. Use the sidebar navigation to access different sections.</p>
    </div>
  `;
}
// synchronize your database with frontend (Keep data up to date), This code has Exception handling.
async function getCollectionCount(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.size;
  } catch (error) {
    console.error(`Error getting ${collectionName} count:`, error);
    return 0;
  }
}
