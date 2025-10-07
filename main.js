import { renderDashboard } from './pages/dashboard.js';
import { renderEmployees } from './pages/employees.js';
import { renderDepartments } from './pages/departments.js';
import { renderServices } from './pages/services.js';
import { renderPurchaseOrders } from './pages/purchase-orders.js';

const pages = {
  'dashboard': renderDashboard,
  'employees': renderEmployees,
  'departments': renderDepartments,
  'services': renderServices,
  'purchase-orders': renderPurchaseOrders
};

async function navigate(page) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.dataset.page === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const pageContent = document.getElementById('pageContent');
  const renderFunction = pages[page];

  if (renderFunction) {
    pageContent.innerHTML = await renderFunction();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const appContainer = document.querySelector('.app-container');

  sidebarToggle.addEventListener('click', () => {
    appContainer.classList.toggle('sidebar-expanded');
  });

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigate(page);
    });
  });

  navigate('dashboard');
});
