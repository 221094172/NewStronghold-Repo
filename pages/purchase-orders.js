import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '../firebase-config.js';

let purchaseOrders = [];

export async function renderPurchaseOrders() {
  await loadPurchaseOrders();

  return `
    <div class="page-header">
      <h1>Purchase Orders</h1>
      <p>Manage equipment and supply purchases</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Purchase Order List</h2>
        <button class="btn btn-primary" onclick="openPurchaseOrderModal()">Add Purchase Order</button>
      </div>
      <div class="table-container">
        ${purchaseOrders.length === 0 ? renderEmptyState() : renderPurchaseOrdersTable()}
      </div>
    </div>

    <div class="modal" id="purchaseOrderModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle">Add Purchase Order</h2>
          <button class="modal-close" onclick="closePurchaseOrderModal()">&times;</button>
        </div>
        <form id="purchaseOrderForm" onsubmit="handlePurchaseOrderSubmit(event)">
          <input type="hidden" id="purchaseOrderId">
          <div class="form-group">
            <label for="itemName">Item Name</label>
            <input type="text" id="itemName" required>
          </div>
          <div class="form-group">
            <label for="supplier">Supplier</label>
            <input type="text" id="supplier" required>
          </div>
          <div class="form-group">
            <label for="amount">Amount</label>
            <input type="number" id="amount" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" onclick="closePurchaseOrderModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📦</div>
      <p>No purchase orders found. Add your first purchase order to get started.</p>
    </div>
  `;
}

function renderPurchaseOrdersTable() {
  return `
    <table>
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Supplier</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${purchaseOrders.map(po => `
          <tr>
            <td>${po.itemName}</td>
            <td>${po.supplier}</td>
            <td>$${parseFloat(po.amount).toFixed(2)}</td>
            <td>${po.date}</td>
            <td>
              <div class="actions">
                <button class="btn btn-secondary btn-small" onclick="editPurchaseOrder('${po.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deletePurchaseOrder('${po.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadPurchaseOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, 'purchase_orders'));
    purchaseOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error loading purchase orders:', error);
  }
}

window.openPurchaseOrderModal = function() {
  const modal = document.getElementById('purchaseOrderModal');
  document.getElementById('modalTitle').textContent = 'Add Purchase Order';
  document.getElementById('purchaseOrderForm').reset();
  document.getElementById('purchaseOrderId').value = '';
  modal.classList.add('active');
};

window.closePurchaseOrderModal = function() {
  const modal = document.getElementById('purchaseOrderModal');
  modal.classList.remove('active');
};

window.handlePurchaseOrderSubmit = async function(event) {
  event.preventDefault();

  const purchaseOrderData = {
    itemName: document.getElementById('itemName').value,
    supplier: document.getElementById('supplier').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value
  };

  const purchaseOrderId = document.getElementById('purchaseOrderId').value;

  try {
    if (purchaseOrderId) {
      await updateDoc(doc(db, 'purchase_orders', purchaseOrderId), purchaseOrderData);
    } else {
      await addDoc(collection(db, 'purchase_orders'), purchaseOrderData);
    }

    closePurchaseOrderModal();
    await loadPurchaseOrders();
    document.getElementById('pageContent').innerHTML = await renderPurchaseOrders();
  } catch (error) {
    console.error('Error saving purchase order:', error);
  }
};

window.editPurchaseOrder = async function(id) {
  const purchaseOrder = purchaseOrders.find(po => po.id === id);
  if (!purchaseOrder) return;

  document.getElementById('modalTitle').textContent = 'Edit Purchase Order';
  document.getElementById('purchaseOrderId').value = id;
  document.getElementById('itemName').value = purchaseOrder.itemName;
  document.getElementById('supplier').value = purchaseOrder.supplier;
  document.getElementById('amount').value = purchaseOrder.amount;
  document.getElementById('date').value = purchaseOrder.date;

  const modal = document.getElementById('purchaseOrderModal');
  modal.classList.add('active');
};

window.deletePurchaseOrder = async function(id) {
  const purchaseOrder = purchaseOrders.find(po => po.id === id);
  if (!purchaseOrder) return;

  try {
    await deleteDoc(doc(db, 'purchase_orders', id));
    await loadPurchaseOrders();
    document.getElementById('pageContent').innerHTML = await renderPurchaseOrders();
  } catch (error) {
    console.error('Error deleting purchase order:', error);
  }
};
