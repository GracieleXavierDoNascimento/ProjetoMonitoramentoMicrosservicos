// Auto-refresh interval (5 seconds)
const REFRESH_INTERVAL = 5000;
let refreshTimer;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    refreshData();
    startAutoRefresh();
});

function startAutoRefresh() {
    refreshTimer = setInterval(refreshData, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
}

async function refreshData() {
    console.log('Refreshing data...');
    await Promise.all([
        updateServicesStatus(),
        updateMetrics(),
        updateAlerts()
    ]);
    updateLastUpdateTime();
}

async function updateServicesStatus() {
    try {
        const response = await fetch('/api/services/status');
        const services = await response.json();
        
        const container = document.getElementById('services-status');
        container.innerHTML = '';
        
        services.forEach(service => {
            const card = document.createElement('div');
            card.className = `service-card ${service.status}`;
            
            card.innerHTML = `
                <div class="service-name">${service.name}</div>
                <span class="service-status ${service.status}">${service.status.toUpperCase()}</span>
                ${service.status !== 'down' ? `
                    <div class="service-metrics">
                        <div class="metric-item">
                            <strong>CPU:</strong> ${service.cpu ? service.cpu.toFixed(2) : 'N/A'}%
                        </div>
                        <div class="metric-item">
                            <strong>Memory:</strong> ${service.memory ? service.memory.toFixed(2) : 'N/A'}%
                        </div>
                    </div>
                ` : `
                    <div class="metric-item" style="margin-top: 10px; color: #dc3545;">
                        <strong>Error:</strong> ${service.error || 'Service is down'}
                    </div>
                `}
            `;
            
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error updating services status:', error);
    }
}

async function updateMetrics() {
    try {
        // Average CPU
        const cpuResponse = await fetch('/api/metrics/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'avg(cpu_usage_percent)' })
        });
        const cpuData = await cpuResponse.json();
        if (cpuData.status === 'success' && cpuData.data.result.length > 0) {
            const cpuValue = parseFloat(cpuData.data.result[0].value[1]);
            document.getElementById('avg-cpu').textContent = `${cpuValue.toFixed(2)}%`;
        }
        
        // Average Memory
        const memResponse = await fetch('/api/metrics/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'avg(memory_usage_percent)' })
        });
        const memData = await memResponse.json();
        if (memData.status === 'success' && memData.data.result.length > 0) {
            const memValue = parseFloat(memData.data.result[0].value[1]);
            document.getElementById('avg-memory').textContent = `${memValue.toFixed(2)}%`;
        }
        
        // Total Requests
        const reqResponse = await fetch('/api/metrics/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'sum(increase(http_requests_total[5m]))' })
        });
        const reqData = await reqResponse.json();
        if (reqData.status === 'success' && reqData.data.result.length > 0) {
            const reqValue = parseFloat(reqData.data.result[0].value[1]);
            document.getElementById('total-requests').textContent = Math.round(reqValue);
        }
        
        // Active Alerts Count
        const alertsResponse = await fetch('/api/alerts/active');
        const alertsData = await alertsResponse.json();
        if (alertsData.status === 'success') {
            const activeAlerts = alertsData.data.alerts.filter(a => a.state === 'firing').length;
            document.getElementById('active-alerts-count').textContent = activeAlerts;
            
            // Change color based on alert count
            const alertElement = document.getElementById('active-alerts-count');
            if (activeAlerts > 0) {
                alertElement.style.color = '#dc3545';
            } else {
                alertElement.style.color = '#28a745';
            }
        }
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

async function updateAlerts() {
    try {
        const response = await fetch('/api/alerts?limit=10');
        const alerts = await response.json();
        
        const container = document.getElementById('alerts-container');
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="loading">No alerts received yet</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // Reverse to show newest first
        alerts.reverse().forEach(alert => {
            const alertDiv = document.createElement('div');
            const severity = alert.labels.severity || 'info';
            alertDiv.className = `alert-item ${severity}`;
            
            const alertName = alert.labels.alertname || 'Unknown Alert';
            const description = alert.annotations.summary || alert.annotations.description || 'No description';
            const status = alert.status || 'unknown';
            
            alertDiv.innerHTML = `
                <div class="alert-header">
                    <span class="alert-name">${alertName}</span>
                    <span class="alert-severity ${severity}">${severity.toUpperCase()}</span>
                </div>
                <div class="alert-description">${description}</div>
                <div class="alert-time">
                    Status: ${status} | Received: ${new Date(alert.received_at).toLocaleString()}
                </div>
            `;
            
            container.appendChild(alertDiv);
        });
    } catch (error) {
        console.error('Error updating alerts:', error);
    }
}

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleTimeString();
}

function clearAlerts() {
    if (confirm('This will clear the alerts display (alerts will come back on next refresh if still active)')) {
        document.getElementById('alerts-container').innerHTML = '<div class="loading">No alerts</div>';
    }
}

async function testServices() {
    stopAutoRefresh();
    
    const services = ['service-a:5000', 'service-b:5001', 'service-c:5002'];
    
    for (const service of services) {
        try {
            // Test different endpoints
            await fetch(`http://${service}/api/data`);
            await fetch(`http://${service}/api/error`);
            console.log(`Tested ${service}`);
        } catch (error) {
            console.error(`Error testing ${service}:`, error);
        }
    }
    
    alert('Service tests initiated. Check the metrics and alerts for results.');
    
    // Refresh immediately and restart auto-refresh
    await refreshData();
    startAutoRefresh();
}
