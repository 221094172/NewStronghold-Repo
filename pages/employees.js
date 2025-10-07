import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '../firebase-config.js';

let employees = [];

export async function renderEmployees() {
  await loadEmployees();

  return `
    <div class="page-header">
      <h1>Employees</h1>
      <p>Manage your security team members</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Employee List</h2>
        <button class="btn btn-primary" onclick="openEmployeeModal()">Add Employee</button>
      </div>
      <div class="table-container">
        ${employees.length === 0 ? renderEmptyState() : renderEmployeesTable()}
      </div>
    </div>

    <div class="modal" id="employeeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle">Add Employee</h2>
          <button class="modal-close" onclick="closeEmployeeModal()">&times;</button>
        </div>
        <form id="employeeForm" onsubmit="handleEmployeeSubmit(event)">
          <input type="hidden" id="employeeId">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="department">Department</label>
            <input type="text" id="department" required>
          </div>
          <div class="form-group">
            <label for="position">Position</label>
            <input type="text" id="position" required>
          </div>
          <div class="form-group">
            <label for="workSchedule">Work Schedule</label>
            <input type="text" id="workSchedule" placeholder="e.g., Mon-Fri 9AM-5PM" required>
          </div>
          <div class="form-group">
            <label for="contact">Contact</label>
            <input type="text" id="contact" placeholder="Phone or Email" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" onclick="closeEmployeeModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">👥</div>
      <p>No employees found. Add your first employee to get started.</p>
    </div>
  `;
}

function renderEmployeesTable() {
  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Position</th>
          <th>Work Schedule</th>
          <th>Contact</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${employees.map(emp => `
          <tr>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>${emp.workSchedule}</td>
            <td>${emp.contact}</td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="editEmployee('${emp.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteEmployee('${emp.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadEmployees() {
  try {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    employees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error loading employees:', error);
  }
}

window.openEmployeeModal = function() {
  const modal = document.getElementById('employeeModal');
  document.getElementById('modalTitle').textContent = 'Add Employee';
  document.getElementById('employeeForm').reset();
  document.getElementById('employeeId').value = '';
  modal.classList.add('active');
};

window.closeEmployeeModal = function() {
  const modal = document.getElementById('employeeModal');
  modal.classList.remove('active');
};

window.handleEmployeeSubmit = async function(event) {
  event.preventDefault();

  const employeeData = {
    name: document.getElementById('name').value,
    department: document.getElementById('department').value,
    position: document.getElementById('position').value,
    workSchedule: document.getElementById('workSchedule').value,
    contact: document.getElementById('contact').value
  };

  const employeeId = document.getElementById('employeeId').value;

  try {
    if (employeeId) {
      await updateDoc(doc(db, 'employees', employeeId), employeeData);
    } else {
      await addDoc(collection(db, 'employees'), employeeData);
    }

    closeEmployeeModal();
    await loadEmployees();
    document.getElementById('pageContent').innerHTML = await renderEmployees();
  } catch (error) {
    console.error('Error saving employee:', error);
  }
};

window.editEmployee = async function(id) {
  const employee = employees.find(emp => emp.id === id);
  if (!employee) return;

  document.getElementById('modalTitle').textContent = 'Edit Employee';
  document.getElementById('employeeId').value = id;
  document.getElementById('name').value = employee.name;
  document.getElementById('department').value = employee.department;
  document.getElementById('position').value = employee.position;
  document.getElementById('workSchedule').value = employee.workSchedule;
  document.getElementById('contact').value = employee.contact;

  const modal = document.getElementById('employeeModal');
  modal.classList.add('active');
};

window.deleteEmployee = async function(id) {
  const employee = employees.find(emp => emp.id === id);
  if (!employee) return;

  if (!confirm(`Are you sure you want to delete ${employee.name}?`)) return;

  try {
    await deleteDoc(doc(db, 'employees', id));
    await loadEmployees();
    document.getElementById('pageContent').innerHTML = await renderEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
  }
};
