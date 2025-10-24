import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '../firebase-config.js';
//initialize collection to departments
let departments = [];
let departmentToDeleteId = null;

export async function renderDepartments() {
  await loadDepartments();
//at   ${departments.length === 0 ? renderEmptyState() : renderDepartmentsTable()}, collects what in the database by string, and than populates it in tables on the frontrnd in each page 
  return `
    <div class="page-header">
      <h1>Departments</h1>
      <p>Manage organizational departments</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Department List</h2>
        <button class="btn btn-primary" onclick="openDepartmentModal()">Add Department</button>
      </div>
      <div class="table-container">
         ${departments.length === 0 ? renderEmptyState() : renderDepartmentsTable()}
      </div>
    </div>

    <div class="modal" id="departmentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle">Add Department</h2>
          <button class="modal-close" onclick="closeDepartmentModal()">&times;</button>
        </div>
        <form id="departmentForm" onsubmit="handleDepartmentSubmit(event)">
          <input type="hidden" id="departmentId">
          <div class="form-group">
            <label for="name">Department Name</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" rows="4" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" onclick="closeDepartmentModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div id="deleteConfirmationModal" class="modal">
        <div class="modal-content">
            <h2>Confirm Deletion</h2>
            <p id="deleteConfirmationMessage"></p>
            <div class="form-actions">
                <button id="confirmDelete" class="btn btn-danger" onclick="confirmDelete()">Delete</button>
                <button id="cancelDelete" class="btn btn-secondary" onclick="cancelDelete()">Cancel</button>
            </div>
        </div>
    </div>
  `;
}
//This important, its the whole building logic of the table
function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">🏢</div>
      <p>No departments found. Add your first department to get started.</p>
    </div>
  `;
}
// here your table is created
function renderDepartmentsTable() {
  return `
    <table>
      <thead>
        <tr>
          <th>Department Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${departments.map(dept => `
          <tr>
            <td>${dept.name}</td>
            <td>${dept.description}</td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="editDepartment('${dept.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteDepartment('${dept.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadDepartments() {
  try {
    const querySnapshot = await getDocs(collection(db, 'departments'));
    departments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error loading departments:', error);
  }
}

window.openDepartmentModal = function() {
  const modal = document.getElementById('departmentModal');
  document.getElementById('modalTitle').textContent = 'Add Department';
  document.getElementById('departmentForm').reset();
  document.getElementById('departmentId').value = '';
  modal.classList.add('active');
};

window.closeDepartmentModal = function() {
  const modal = document.getElementById('departmentModal');
  modal.classList.remove('active');
};

window.handleDepartmentSubmit = async function(event) {
  event.preventDefault();

  const departmentData = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value
  };

  const departmentId = document.getElementById('departmentId').value;

  try {
    if (departmentId) {
      await updateDoc(doc(db, 'departments', departmentId), departmentData);
    } else {
      await addDoc(collection(db, 'departments'), departmentData);
    }

    closeDepartmentModal();
    await loadDepartments();
    document.getElementById('pageContent').innerHTML = await renderDepartments();
  } catch (error) {
    console.error('Error saving department:', error);
  }
};

window.editDepartment = async function(id) {
  const department = departments.find(dept => dept.id === id);
  if (!department) return;

  document.getElementById('modalTitle').textContent = 'Edit Department';
  document.getElementById('departmentId').value = id;
  document.getElementById('name').value = department.name;
  document.getElementById('description').value = department.description;

  const modal = document.getElementById('departmentModal');
  modal.classList.add('active');
};

window.deleteDepartment = async function(id) {
  const department = departments.find(dept => dept.id === id);
  if (!department) return;

  departmentToDeleteId = id;
  const modal = document.getElementById('deleteConfirmationModal');
  const message = document.getElementById('deleteConfirmationMessage');
  message.textContent = `Are you sure you want to delete ${department.name}?`;
  modal.classList.add('active');
};

window.confirmDelete = async function() {
    if (departmentToDeleteId) {
        try {
            await deleteDoc(doc(db, 'departments', departmentToDeleteId));
            await loadDepartments();
            document.getElementById('pageContent').innerHTML = await renderDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    }
    cancelDelete();
}

window.cancelDelete = function() {
    const modal = document.getElementById('deleteConfirmationModal');
    modal.classList.remove('active');
    departmentToDeleteId = null;
}
