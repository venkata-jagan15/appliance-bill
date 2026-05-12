// State Management
const state = {
    theme: localStorage.getItem('theme') || 'light',
    currentView: 'appliances',
    consumerType: 'domestic',
    appliances: JSON.parse(localStorage.getItem('appliances')) || [],
    solar: {
        generated: 0,
        buybackRate: 3.5
    },
    history: JSON.parse(localStorage.getItem('history')) || []
};

// Constants
const SLABS = {
    domestic: [
        { max: 50, rate: 1.5 },
        { max: 100, rate: 2.5 },
        { max: 200, rate: 4.0 },
        { max: 300, rate: 6.0 },
        { max: Infinity, rate: 8.0 }
    ],
    commercial: [{ max: Infinity, rate: 10.0 }],
    industrial: [{ max: Infinity, rate: 12.0 }]
};

const APPLIANCE_PRESETS = {
    ac: { name: 'Air Conditioner', watts: 1500 },
    fridge: { name: 'Refrigerator', watts: 200 },
    fan: { name: 'Ceiling Fan', watts: 75 },
    light: { name: 'LED Bulb', watts: 9 },
    tv: { name: 'Television', watts: 100 },
    custom: { name: 'Custom Device', watts: 0 }
};

// DOM Elements
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view'),
    openAddModal: document.getElementById('open-add-modal'),
    closeAddModal: document.getElementById('close-add-modal'),
    addModalOverlay: document.getElementById('add-modal-overlay'),
    addApplianceBtn: document.getElementById('add-appliance-btn'),
    appliancesList: document.getElementById('appliances-list'),
    consumerBtns: document.querySelectorAll('.consumer-btn'),
    slabDetails: document.getElementById('slab-details'),
    inputSolar: document.getElementById('input-solar'),
    inputBuyback: document.getElementById('input-buyback'),
    totalBillAmount: document.getElementById('total-bill-amount'),
    summaryDetails: document.getElementById('summary-details'),
    historyList: document.getElementById('history-list'),
    saveHistoryBtn: document.getElementById('save-history')
};

// Initialization
function init() {
    applyTheme();
    renderSlabs();
    renderAppliances();
    updateCalculations();
    renderHistory();
    
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // Theme Toggle
    elements.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', state.theme);
        applyTheme();
    });

    // Consumer Type Toggle
    elements.consumerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.consumerType = btn.getAttribute('data-type');
            elements.consumerBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
            elements.consumerBtns.forEach(b => b.classList.add('btn-secondary'));
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-secondary');
            renderSlabs();
            updateCalculations();
        });
    });

    // Modal Events
    elements.openAddModal.addEventListener('click', () => elements.addModalOverlay.classList.add('active'));
    elements.closeAddModal.addEventListener('click', () => elements.addModalOverlay.classList.remove('active'));
    
    document.getElementById('modal-app-category').addEventListener('change', (e) => {
        const preset = APPLIANCE_PRESETS[e.target.value];
        if (preset) document.getElementById('modal-app-watts').value = preset.watts;
    });

    elements.addApplianceBtn.addEventListener('click', addAppliance);

    // Solar Inputs
    elements.inputSolar.addEventListener('input', (e) => {
        state.solar.generated = parseFloat(e.target.value) || 0;
        updateCalculations();
    });
    elements.inputBuyback.addEventListener('input', (e) => {
        state.solar.buybackRate = parseFloat(e.target.value) || 0;
        updateCalculations();
    });

    // Save History
    elements.saveHistoryBtn.addEventListener('click', saveToHistory);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Failed', err));
    }
}

// Logic Functions
function switchView(viewId) {
    state.currentView = viewId;
    elements.views.forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    elements.navItems.forEach(nav => {
        nav.classList.toggle('active', nav.getAttribute('data-view') === viewId);
    });
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function renderSlabs() {
    const slabs = SLABS[state.consumerType];
    elements.slabDetails.innerHTML = slabs.map((s, i) => `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.875rem;">
            <span>${s.max === Infinity ? 'Above ' + slabs[i-1].max : (i === 0 ? '0 - ' + s.max : (slabs[i-1].max + 1) + ' - ' + s.max)} units</span>
            <span style="font-weight: 600;">₹${s.rate.toFixed(2)} / unit</span>
        </div>
    `).join('');
}

function addAppliance() {
    const category = document.getElementById('modal-app-category').value;
    const watts = parseFloat(document.getElementById('modal-app-watts').value);
    const qty = parseInt(document.getElementById('modal-app-qty').value);
    const hours = parseFloat(document.getElementById('modal-app-hours').value);
    const days = parseInt(document.getElementById('modal-app-days').value);

    if (!watts || !qty) return alert('Please enter valid power and quantity');

    const appliance = {
        id: Date.now(),
        name: APPLIANCE_PRESETS[category].name,
        watts,
        qty,
        hours,
        days,
        units: (watts * qty * hours * days) / 1000
    };

    state.appliances.push(appliance);
    localStorage.setItem('appliances', JSON.stringify(state.appliances));
    
    elements.addModalOverlay.classList.remove('active');
    renderAppliances();
    updateCalculations();
}

function deleteAppliance(id) {
    state.appliances = state.appliances.filter(a => a.id !== id);
    localStorage.setItem('appliances', JSON.stringify(state.appliances));
    renderAppliances();
    updateCalculations();
}

function renderAppliances() {
    if (state.appliances.length === 0) {
        elements.appliancesList.innerHTML = `<div class="text-muted" style="text-align: center; padding: 40px;">No appliances added yet.</div>`;
        return;
    }

    elements.appliancesList.innerHTML = state.appliances.map(app => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px;">
            <div>
                <div style="font-weight: 600;">${app.name} (${app.qty})</div>
                <div class="text-sm text-muted">${app.watts}W • ${app.hours}h/day • ${app.days} days</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: var(--primary);">${app.units.toFixed(2)} kWh</div>
                <i class="fas fa-trash text-muted" style="cursor: pointer; font-size: 0.875rem; margin-top: 5px;" onclick="deleteAppliance(${app.id})"></i>
            </div>
        </div>
    `).join('');
}

function updateCalculations() {
    const totalConsumption = state.appliances.reduce((sum, app) => sum + app.units, 0);
    const solarGen = state.solar.generated;
    const netUsage = Math.max(0, totalConsumption - solarGen);
    const exportUnits = Math.max(0, solarGen - totalConsumption);

    // Update Solar Stats
    document.getElementById('stat-consumption').innerText = `${totalConsumption.toFixed(1)} kWh`;
    document.getElementById('stat-solar').innerText = `${solarGen.toFixed(1)} kWh`;
    document.getElementById('stat-net').innerText = `${netUsage.toFixed(1)} kWh`;
    document.getElementById('stat-export').innerText = `${exportUnits.toFixed(1)} kWh`;

    // Calculate Bill
    let billAmount = 0;
    const slabs = SLABS[state.consumerType];
    let remainingUnits = netUsage;

    if (state.consumerType === 'domestic') {
        let prevMax = 0;
        for (const slab of slabs) {
            const slabUnits = Math.min(remainingUnits, slab.max - prevMax);
            if (slabUnits <= 0) break;
            billAmount += slabUnits * slab.rate;
            remainingUnits -= slabUnits;
            prevMax = slab.max;
        }
    } else {
        billAmount = netUsage * slabs[0].rate;
    }

    // Solar Credit
    const solarCredit = exportUnits * state.solar.buybackRate;
    const finalBill = Math.max(0, billAmount - solarCredit);

    // Update UI
    elements.totalBillAmount.innerText = `₹${finalBill.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    elements.summaryDetails.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Gross Energy Charges</span>
            <span>₹${billAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--success);">
            <span>Solar Credit (${exportUnits.toFixed(1)} units)</span>
            <span>- ₹${solarCredit.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Fixed Charges</span>
            <span>₹50.00</span>
        </div>
    `;
    
    // Actually add fixed charges to final bill
    elements.totalBillAmount.innerText = `₹${(finalBill + 50).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function saveToHistory() {
    const totalBill = elements.totalBillAmount.innerText;
    const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        units: state.appliances.reduce((sum, app) => sum + app.units, 0).toFixed(1),
        amount: totalBill,
        type: state.consumerType
    };

    state.history.unshift(entry);
    localStorage.setItem('history', JSON.stringify(state.history));
    renderHistory();
    alert('Bill saved to history!');
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `<div class="text-muted" style="text-align: center; padding: 40px;">No history records found.</div>`;
        return;
    }

    elements.historyList.innerHTML = state.history.map(item => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px;">
            <div>
                <div style="font-weight: 600;">${item.date}</div>
                <div class="text-sm text-muted">${item.units} kWh • ${item.type}</div>
            </div>
            <div style="font-weight: 700; color: var(--primary);">${item.amount}</div>
        </div>
    `).join('');
}

init();
