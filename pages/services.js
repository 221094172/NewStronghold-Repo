import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '../firebase-config.js';

let services = [];

export async function renderServices() {
  await loadServices();

  return `
    <div class="page-header">
      <h1>Services Offered</h1>
      <p>Track security services provided to clients</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Service List</h2>
        <button class="btn btn-primary" onclick="openServiceModal()">Add Service</button>
      </div>
      <div class="table-container">
        ${services.length === 0 ? renderEmptyState() : renderServicesTable()}
      </div>
    </div>

    <div class="modal" id="serviceModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle">Add Service</h2>
          <button class="modal-close" onclick="closeServiceModal()">&times;</button>
        </div>
        <form id="serviceForm" onsubmit="handleServiceSubmit(event)">
          <input type="hidden" id="serviceId">
          <div class="form-group">
            <label for="clientName">Client Name</label>
            <input type="text" id="clientName" required>
          </div>
          <div class="form-group">
            <label for="serviceType">Service Type</label>
            <select id="serviceType" required>
              <option value="">Select Service Type</option>
              <option value="CCTV">CCTV Installation</option>
              <option value="Guarding">Security Guarding</option>
              <option value="Patrol">Security Patrol</option>
              <option value="Access Control">Access Control</option>
              <option value="Alarm System">Alarm System</option>
              <option value="Consultation">Security Consultation</option>
            </select>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" required>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" required>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" onclick="closeServiceModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">🛡️</div>
      <p>No services found. Add your first service record to get started.</p>
    </div>
  `;
}

function renderServicesTable() {
  return `
    <table>
      <thead>
        <tr>
          <th>Client Name</th>
          <th>Service Type</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${services.map(service => `
          <tr>
            <td>${service.clientName}</td>
            <td>${service.serviceType}</td>
            <td>${service.date}</td>
            <td>${service.status}</td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="editService('${service.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteService('${service.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadServices() {
  try {
    const querySnapshot = await getDocs(collection(db, 'services'));
    services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

window.openServiceModal = function() {
  const modal = document.getElementById('serviceModal');
  document.getElementById('modalTitle').textContent = 'Add Service';
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  modal.classList.add('active');
};

window.closeServiceModal = function() {
  const modal = document.getElementById('serviceModal');
  modal.classList.remove('active');
};

window.handleServiceSubmit = async function(event) {
  event.preventDefault();

  const serviceData = {
    clientName: document.getElementById('clientName').value,
    serviceType: document.getElementById('serviceType').value,
    date: document.getElementById('date').value,
    status: document.getElementById('status').value
  };

  const serviceId = document.getElementById('serviceId').value;

  try {
    if (serviceId) {
      await updateDoc(doc(db, 'services', serviceId), serviceData);
    } else {
      await addDoc(collection(db, 'services'), serviceData);
    }

    closeServiceModal();
    await loadServices();
    document.getElementById('pageContent').innerHTML = await renderServices();
  } catch (error) {
    console.error('Error saving service:', error);
  }
};

window.editService = async function(id) {
  const service = services.find(s => s.id === id);
  if (!service) return;

  document.getElementById('modalTitle').textContent = 'Edit Service';
  document.getElementById('serviceId').value = id;
  document.getElementById('clientName').value = service.clientName;
  document.getElementById('serviceType').value = service.serviceType;
  document.getElementById('date').value = service.date;
  document.getElementById('status').value = service.status;

  const modal = document.getElementById('serviceModal');
  modal.classList.add('active');
};

window.deleteService = async function(id) {
  const service = services.find(s => s.id === id);
  if (!service) return;

  if (!confirm(`Are you sure you want to delete this service for ${service.clientName}?`)) return;

  try {
    await deleteDoc(doc(db, 'services', id));
    await loadServices();
    document.getElementById('pageContent').innerHTML = await renderServices();
  } catch (error) {
    console.error('Error deleting service:', error);
  }
};
