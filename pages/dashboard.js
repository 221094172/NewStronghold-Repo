import { db, collection, getDocs } from '../firebase-config.js';
import { addLog } from '../utils/logger.js';

export async function renderDashboard() {
  addLog('Dashboard loaded');

  const [employeesCount, departmentsCount, servicesCount, purchaseOrdersCount] = await Promise.all([
    getCollectionCount('employees'),
    getCollectionCount('departments'),
    getCollectionCount('services'),
    getCollectionCount('purchase_orders')
  ]);

  return `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome to Stronghold Tech Security System</p>
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

async function getCollectionCount(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.size;
  } catch (error) {
    console.error(`Error getting ${collectionName} count:`, error);
    return 0;
  }
}
