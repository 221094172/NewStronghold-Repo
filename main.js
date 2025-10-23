import Navigo from 'navigo';
import { renderDashboard } from './pages/dashboard.js';
import { renderEmployees } from './pages/employees.js';
import { renderDepartments } from './pages/departments.js';
import { renderServices } from './pages/services.js';
import { renderPurchaseOrders } from './pages/purchase-orders.js';

const router = new Navigo('/');

const pages = {
  'dashboard': renderDashboard,
  'employees': renderEmployees,
  'departments': renderDepartments,
  'services': renderServices,
  'purchase-orders': renderPurchaseOrders
};

async function renderPage(page) {
  const appContainer = document.querySelector('.app-container');
  const mainContent = document.getElementById('mainContent');

  // Remove all page-specific classes
  for (const pageName in pages) {
    appContainer.classList.remove(`${pageName}-page`);
  }
  
  // Add the class for the current page
  appContainer.classList.add(`${page}-page`);

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('href') === `/${page}`) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  let searchBarHtml = '';
  if (page === 'employees' || page === 'departments') {
    searchBarHtml = `
      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search...">
        <button id="searchButton"><i class="fas fa-search"></i></button>
      </div>
    `;
  }

  const renderFunction = pages[page];
  let pageHtml = '';
  if (renderFunction) {
      pageHtml = await renderFunction();
  }

  mainContent.innerHTML = searchBarHtml + `<div id="pageContent">${pageHtml}</div>`;

  if (page === 'employees' || page === 'departments') {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    const performSearch = () => {
      const searchTerm = searchInput.value.toLowerCase();
      const table = mainContent.querySelector('table');
      if (table) {
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          let match = false;
          cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(searchTerm)) {
              match = true;
            }
          });
          row.style.display = match ? '' : 'none';
        });
      }
    };

    if(searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            performSearch();
          }
        });
    }
  }
}

router.on({
  '/': () => renderPage('dashboard'),
  '/employees': () => renderPage('employees'),
  '/departments': () => renderPage('departments'),
  '/services': () => renderPage('services'),
  '/purchase-orders': () => renderPage('purchase-orders')
}).resolve();

document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const appContainer = document.querySelector('.app-container');

  sidebarToggle.addEventListener('click', () => {
    appContainer.classList.toggle('sidebar-expanded');
  });

  const navLinks = document.querySelectorAll('.nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = e.currentTarget.getAttribute('href');
      router.navigate(path);
    });
  });
});
