export function addLog(message) {
  const logContent = document.getElementById('logContent');
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.textContent = message;
  logContent.appendChild(logEntry);

  logContent.scrollTop = logContent.scrollHeight;
}

export function clearLogs() {
  const logContent = document.getElementById('logContent');
  logContent.innerHTML = '<div class="log-entry">Logs cleared</div>';
}
