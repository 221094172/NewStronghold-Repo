import Navigo from 'navigo';
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
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

function getInitials(email) {
    if (!email) return '';
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length > 1) {
        return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

async function renderPage(page) {
  const appContainer = document.querySelector('.app-container');
  const pageContent = document.getElementById('pageContent');

  for (const pageName in pages) {
    appContainer.classList.remove(`${pageName}-page`);
  }
  
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

  pageContent.innerHTML = searchBarHtml + pageHtml;

  if (page === 'employees' || page === 'departments') {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    const performSearch = () => {
      const searchTerm = searchInput.value.toLowerCase();
      const table = pageContent.querySelector('table');
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user);
    
    const userProfile = document.getElementById('userProfile');
    const userInitials = document.getElementById('userInitials');
    const userEmailDropdown = document.getElementById('userEmailDropdown');
    const userEmail = document.getElementById('userEmail');

    if (userProfile && userInitials && userEmailDropdown && userEmail) {
      const email = user.email;
      const initials = getInitials(email);
      
      userInitials.textContent = initials;
      userEmail.textContent = email;

      userProfile.addEventListener('click', () => {
        userEmailDropdown.style.display = userEmailDropdown.style.display === 'block' ? 'none' : 'block';
      });

      window.addEventListener('click', function(e) {
        if (!userProfile.contains(e.target)) {
          userEmailDropdown.style.display = 'none';
        }
      });
    }

    router.on({
      '/': () => renderPage('dashboard'),
      '/employees': () => renderPage('employees'),
      '/departments': () => renderPage('departments'),
      '/services': () => renderPage('services'),
      '/purchase-orders': () => renderPage('purchase-orders')
    }).resolve();

  } else {
    console.log('User is signed out');
    window.location.href = '/login.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const appContainer = document.querySelector('.app-container');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      appContainer.classList.toggle('sidebar-expanded');
    });
  }

  const navLinks = document.querySelectorAll('.nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = e.currentTarget.getAttribute('href');
      if(path && path !== '#') { // Check if path is not just '#'
        router.navigate(path);
      }
    });
  });

  // Logout functionality
  const logoutButton = document.getElementById('logoutButton');
  const logoutConfirmationModal = document.getElementById('logoutConfirmationModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');

  if(logoutButton && logoutConfirmationModal) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        logoutConfirmationModal.classList.add('active');
      });

      confirmLogout.addEventListener('click', () => {
        signOut(auth).then(() => {
          console.log('User signed out successfully');
          window.location.href = '/login.html';
        }).catch((error) => {
          console.error('Sign out error:', error);
        });
      });

      cancelLogout.addEventListener('click', () => {
        logoutConfirmationModal.classList.remove('active');
      });

      window.addEventListener('click', (e) => {
          if (e.target == logoutConfirmationModal) {
            logoutConfirmationModal.classList.remove('active');
          }
      });
  }
});
