// Smart Farming System - Enhanced Version with Medicine Supplier Location Feature
const firebaseConfig = {
    apiKey: "AIzaSyBFqwuLupJ0P4GLiqZlzeB5N5Yj4S6FqKY",
    authDomain: "smart-farming-130fe.firebaseapp.com",
    projectId: "smart-farming-130fe",
    databaseURL: "https://smart-farming-130fe-default-rtdb.firebaseio.com",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("🔥 User logged in:", user.email);

        // SAVE USER
        appInstance.currentUser = {
            email: user.email,
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0]
        };

        // Check if we have a saved page, otherwise default to mainDashboard
        const savedPage = localStorage.getItem('lastPage') || 'mainDashboard';
        appInstance.showMainDashboard(savedPage);
    } else {
        console.log("❌ No user logged in");
        appInstance.navigateToPage('loginPage');
    }
});


class SmartFarmApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'loginPage';
        this.sensorIntervals = [];
        this.charts = {};
        
        // Sample data from JSON plus enhanced data
        this.sensorData = {
            moisture: 45,
            humidity: 68,
            temperature: 78,
            ph: 85,
            nitrogen: 72,
            water: 60
        };

        this.motorPrediction = {
            recommendedTime: 12,
            confidence: 87,
            explanation: "Based on soil moisture, weather, and historical data"
        };

        this.diseaseDatabase = [
            {
                disease: "Early Blight",
                confidence: 87,
                severity: "Moderate",
                affectedArea: "Leaf margins and spots",
                primaryTreatment: "Carbendazim 50% WP - Apply 1g/L water",
                secondaryTreatment: "Copper Sulfate solution - 2g/L",
                applicationMethod: "Spray every 7-10 days",
                prevention: "Improve air circulation, avoid overhead watering"
            },
            {
                disease: "Leaf Spot",
                confidence: 92,
                severity: "Mild",
                affectedArea: "Central leaf tissue",
                primaryTreatment: "Mancozeb 75% WP - Apply 2g/L water",
                secondaryTreatment: "Neem oil solution - 5ml/L",
                applicationMethod: "Spray weekly in evening",
                prevention: "Remove infected leaves, ensure proper spacing"
            }
        ];



        // Medicine suppliers data from JSON
        this.medicineSuppliers = [
            {
                name: "Green Farm Supplies",
                distance: "2.1 km",
                travelTime: "5 mins",
                phone: "+91-9876543210",
                address: "123 Agricultural Street, Bangalore",
                availability: "In Stock",
                medicines: ["Carbendazim 50% WP", "Copper Sulfate", "Mancozeb 75% WP"],
                rating: "4.5",
                openHours: "9:00 AM - 7:00 PM"
            },
            {
                name: "Agricultural Store",
                distance: "3.5 km", 
                travelTime: "8 mins",
                phone: "+91-9876543211",
                address: "456 Farming Road, Bangalore",
                availability: "Limited Stock",
                medicines: ["Carbendazim 50% WP", "Neem Oil Solution"],
                rating: "4.2",
                openHours: "8:30 AM - 8:00 PM"
            },
            {
                name: "Plant Care Center",
                distance: "1.8 km",
                travelTime: "4 mins", 
                phone: "+91-9876543212",
                address: "789 Garden Avenue, Bangalore",
                availability: "In Stock",
                medicines: ["Copper Sulfate", "Sulfur 80% WP", "Mancozeb 75% WP"],
                rating: "4.7",
                openHours: "9:30 AM - 6:30 PM"
            },
            {
                name: "Farm Solutions Hub",
                distance: "4.2 km",
                travelTime: "10 mins",
                phone: "+91-9876543213", 
                address: "321 Crop Care Lane, Bangalore",
                availability: "Out of Stock",
                medicines: ["Neem Oil Solution", "Potassium Bicarbonate"],
                rating: "4.0",
                openHours: "10:00 AM - 7:30 PM"
            }
        ];

        this.dailyTasks = [
            {task: "Check soil moisture levels", priority: "high", completed: false, id: 1},
            {task: "Inspect for pest damage", priority: "medium", completed: true, id: 2},
            {task: "Apply fertilizer to north field", priority: "high", completed: false, id: 3},
            {task: "Clean irrigation filters", priority: "low", completed: false, id: 4}
        ];

        this.currentLanguage = localStorage.getItem('appLanguage') || 'en';
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('Smart Farm App starting setup');
        
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
            this.setupEventListeners();
            this.checkExistingSession();
            console.log('Setup complete');
        }, 100);
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Language Selector
        this.setupLanguageSelector();
        
        // Auth system - Use more direct approach
        this.setupAuth();
        
        // Bottom navigation
        this.setupBottomNavigation();
        
        // Page navigation
        this.setupPageNavigation();
        
        // Feature-specific setups
        this.setupScanner();
        this.setupDailyTasks();
        this.setupMapControls();
    }
    
    setupLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
            // Initial translation
            this.updatePageLanguage();
        }
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('appLanguage', lang);
        this.updatePageLanguage();
    }

    updatePageLanguage() {
        const langData = translations[this.currentLanguage];
        if (!langData) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[key]) {
                let text = langData[key];
                
                // Special handling for welcome message to preserve user name
                if (key === 'welcome') {
                    const name = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Farmer';
                    text = text.replace('Farmer', name)
                               .replace('விவசாயி', name)
                               .replace('రైతు', name)
                               .replace('किसान', name);
                }
                
                el.textContent = text;
            }
        });
    }

   // ===============================
setupAuth() {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            if (!email || !password) {
                alert("Email & password required");
                return;
            }

            this.currentUser = { email };
            this.showDashboard();
        });
    }
}
    showDashboard() {
        console.log('Showing dashboard');
        this.navigateToPage('mainDashboard');
        this.initSensorData();
        this.startSensorUpdates(); 
        
    }
setupCropRecommendation() {
    const soilTestBtn = document.getElementById("startSoilTestBtn");
    if (!soilTestBtn) {
        console.error("startSoilTestBtn not found");
        return;
    }

    // 🔥 PREVENT MULTIPLE LISTENERS
    soilTestBtn.onclick = null;

    soilTestBtn.onclick = () => {
        soilTestBtn.innerText = "Analyzing Soil...";
        soilTestBtn.disabled = true;

        fetch("/api/ml/crop-predict") // Updated to match routing in app.py
            .then(res => res.json())
            .then(data => {
                console.log("ML API RESPONSE:", data);

                let crop = null;
                if (data.status === "success" && data.prediction) {
                    crop = data.prediction;
                } else if (data.prediction) {
                    crop = Array.isArray(data.prediction) ? data.prediction[0] : data.prediction;
                } else if (data.result) {
                    crop = data.result;
                }

                if (!crop) {
                    alert("Prediction missing from backend");
                    soilTestBtn.disabled = false;
                    soilTestBtn.innerText = "Perform Soil Testing";
                    return;
                }

                // Update UI elements
                const predictedCropEl = document.getElementById("predictedCrop");
                const cropConfidenceEl = document.getElementById("cropConfidence");
                const cropConfidenceContainer = document.getElementById("cropConfidenceContainer");
                const cropExplanationEl = document.getElementById("cropExplanation");

                if (predictedCropEl) {
                    predictedCropEl.innerText = crop;
                    predictedCropEl.classList.remove("loading-text");
                }
                
                if (data.confidence && cropConfidenceEl && cropConfidenceContainer) {
                    cropConfidenceEl.innerText = data.confidence + "%";
                    cropConfidenceContainer.style.display = "block";
                } else if (cropConfidenceContainer) {
                    cropConfidenceContainer.style.display = "none";
                }

                if (cropExplanationEl) {
                    cropExplanationEl.innerText = `Based on current soil conditions (N, P, K) and weather (Temp, Humidity), ${crop} is the most suitable crop for your farm. Data fetched from Firebase.`;
                }

                soilTestBtn.innerText = "Soil Analysis Complete";
                soilTestBtn.disabled = false;
                
                this.showNotification(`Recommended crop: ${crop} (Data from Database)`, 'success');
            })
            .catch(err => {
                console.error(err);
                alert("Soil testing failed");
                soilTestBtn.disabled = false;
                soilTestBtn.innerText = "Perform Soil Testing";
            });
    };
}


// ==============================
// PAGE NAVIGATION (SPA)
// ===============================
setupNavigation() {
    document.querySelectorAll(".bottom-nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const page = btn.getAttribute("data-page");
            this.navigateToPage(page);
        });
    });
}


    
  handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log("Login success");
            // ❌ DO NOT redirect here
            // Firebase will auto trigger onAuthStateChanged
        })
        .catch(err => {
            alert(err.message);
        });
}



    
  handleSignup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            console.log("Signup success");
        })
        .catch(err => alert(err.message));
}



    
    showMainDashboard(pageId = 'mainDashboard') {
        console.log('Showing main dashboard:', pageId);
        
        // Update user name and language
        this.updatePageLanguage();
        
        // Navigate to the correct page
        this.navigateToPage(pageId);
        
        // Show bottom navigation
        this.showBottomNav();
        
        // Initialize dashboard features
        this.initSensorData();
        this.startSensorUpdates();
        
        console.log('Main dashboard initialization complete');
    }
    
    navigateToPage(pageId) {
    console.log('Navigating to:', pageId);

    // Save page state for session persistence
    if (pageId !== 'loginPage') {
        localStorage.setItem('lastPage', pageId);
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        this.currentPage = pageId;
    }

    // 🔥 BOTTOM NAV CONTROL
    if (pageId === "loginPage") {
        this.hideBottomNav();   // ❌ hide in login
    } else {
        this.showBottomNav();   // ✅ show everywhere else
    }

    // Initialize page-specific logic
    this.initializePage(pageId);

    // Update bottom nav active state
    this.updateBottomNavigation(pageId);
}

    
    initializePage(pageId) {
        switch (pageId) {
            case 'mainDashboard':
                this.initSensorData();
                this.setupIrrigationPrediction()
                this.setupCropRecommendation();
                break;
            case 'scannerPage':
                this.initScanner();
                break;
            case 'locationPage':
                this.initLocationPage();
                break;
            case 'dailyTasksPage':
                this.initDailyTasksPage();
                break;
            case 'sensorsPage':
                this.initSensorsPage();
                break;
        }
    }
    
    setupBottomNavigation() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = item.getAttribute('data-page');
                console.log('Bottom nav clicked:', targetPage);
                this.navigateToPage(targetPage);
                this.setActiveNavItem(item);
            });
        });
    }
    
    setActiveNavItem(activeItem) {
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }
    
    updateBottomNavigation(pageId) {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            }
        });
    }
    
    showBottomNav() {
        const bottomNav = document.getElementById('bottomTaskBar');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }
    }
    
    hideBottomNav() {
        const bottomNav = document.getElementById('bottomTaskBar');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
    }
    
    setupPageNavigation() {
        // Back buttons
        document.querySelectorAll('[id^="backToMainDashboard"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage('mainDashboard');
            });
        });
        
        // Logout buttons
        document.querySelectorAll('#logoutBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }
    
    // Sensor Data Methods
    initSensorData() {
        console.log('Initializing sensor data');
        this.updateSensorPercentages();
        setTimeout(() => this.animateProgressBars(), 200);
    }
    
    updateSensorPercentages() {
        Object.entries(this.sensorData).forEach(([key, value]) => {
            const percentElement = document.getElementById(`${key}Percent`);
            const progressElement = document.getElementById(`${key}Progress`);
            
            if (percentElement) {
                // Ensure value is a number and format it
                const displayValue = typeof value === 'number' ? Math.round(value) : value;
                percentElement.textContent = displayValue + (key === 'ph' ? '' : '%');
            }
            
            if (progressElement) {
                // For pH, we might want a different progress calculation (0-14 scale)
                let width = value;
                if (key === 'ph') {
                    width = (value / 14) * 100;
                }
                
                progressElement.style.width = Math.min(100, Math.max(0, width)) + '%';
                
                // Color coding logic
                let color = '#6BB66B'; // Default Green
                if (key === 'temperature') {
                    if (value > 35) color = '#f44336'; // High Temp Red
                    else if (value > 28) color = '#FF9800'; // Warm Orange
                }
                if (key === 'moisture' && value < 30) color = '#f44336'; // Dry Red
                if (key === 'water' && value < 20) color = '#f44336'; // Low Water Red
                if (key === 'ph') {
                    if (value < 6 || value > 8) color = '#FF9800'; // Not neutral
                }
                
                progressElement.style.backgroundColor = color;
            }
        });
    }
    
    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 1.5s ease-out';
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        });
    }
    
    startSensorUpdates() {
        this.clearIntervals();

        const dbStatus = document.getElementById('dbStatus');

        // 🔗 Real-time Firebase Listener for Sensor Data
        // Listening to the root node "/" based on the provided Firebase URL
        const sensorRef = firebase.database().ref("/");
        
        // Handle Connection Status
        const connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("🟢 Firebase Connected");
                if (dbStatus) {
                    dbStatus.style.background = "#e8f5e9";
                    dbStatus.style.color = "#2e7d32";
                    dbStatus.innerHTML = '<i class="fas fa-circle" style="font-size: 0.5rem; margin-right: 4px; vertical-align: middle;"></i> LIVE';
                }
            } else {
                console.log("🔴 Firebase Disconnected");
                if (dbStatus) {
                    dbStatus.style.background = "#ffebee";
                    dbStatus.style.color = "#c62828";
                    dbStatus.innerHTML = '<i class="fas fa-circle" style="font-size: 0.5rem; margin-right: 4px; vertical-align: middle;"></i> OFFLINE';
                }
            }
        });

        sensorRef.on("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log("📡 Real-time Sensor Update:", data);
                
                // Flexible mapping to handle different possible database field names
                // 🔥 Exact mapping based on your Firebase screenshot
this.sensorData.moisture = data.soil_moisture ?? 0;
this.sensorData.humidity = data.humidity ?? 0;
this.sensorData.temperature = data.temperature ?? 0;
this.sensorData.ph = data.ph ?? 0;
this.sensorData.nitrogen = data.N ?? 0;
this.sensorData.water = data.water_level ?? 0;

                // Update UI immediately for "Rapid" response
                this.updateSensorPercentages();
                
                if (this.currentPage === 'sensorsPage') {
                    this.updateDetailSensors();
                }
            }
        }, (error) => {
            console.error("Firebase Read Error:", error);
            if (dbStatus) {
                dbStatus.style.background = "#fff3e0";
                dbStatus.style.color = "#ef6c00";
                dbStatus.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 0.5rem; margin-right: 4px; vertical-align: middle;"></i> ERROR';
            }
        });
    }
    
    updateSensorReadings() {
    fetch("/get-sensor-data")
        .then(res => res.json())
        .then(data => {
            console.log("Live Sensor Data:", data);

            // 🔥 MAP FIREBASE KEYS TO YOUR UI KEYS

            this.sensorData.soilMoisture = data.soil_moisture || 0;
            this.sensorData.humidity = data.humidity || 0;
            this.sensorData.temperature = data.temperature || 0;
            this.sensorData.waterLevel = data.water_level || 0;

            this.sensorData.phLevel = data.ph || 0;
            this.sensorData.nitrogen = data.N || 0;

            // Update UI
            this.updateSensorPercentages();

            if (this.currentPage === 'sensorsPage') {
                this.updateDetailSensors();
            }
        })
        .catch(err => console.error("Sensor Fetch Error:", err));
}
    
    setupIrrigationPrediction() {
        const btn = document.getElementById("startMotorBtn");
        const toggleAutoBtn = document.getElementById("toggleAutoBtn");
        const autoBtnText = document.getElementById("autoBtnText");
        const autoTimerContainer = document.getElementById("autoTimerContainer");
        const autoTimer = document.getElementById("autoTimer");

        if (!btn || !toggleAutoBtn) return;

        let countdownInterval = null;
        const AUTO_PREDICT_TIME = 180; // 3 minutes

        const resetAutoUI = () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            autoBtnText.innerText = "Start Automatic";
            toggleAutoBtn.style.backgroundColor = "#007bff";
            const icon = toggleAutoBtn.querySelector('i');
            if (icon) icon.className = "fas fa-play";
            autoTimerContainer.style.display = "none";
        };

        const performPrediction = (isAuto = false) => {
            if (!isAuto) {
                btn.innerText = "Predicting...";
                btn.disabled = true;
            }

            return fetch("/api/ml/irrigation-predict")
                .then(res => {
                    if (!res.ok) throw new Error("Server response not OK");
                    return res.json();
                })
                .then(data => {
                    console.log("Irrigation ML Response:", data);
                    if (!data.motor_status) throw new Error("Irrigation prediction failed");

                    const resultBox = document.getElementById("irrigationResultBox");
                    const resultText = document.getElementById("irrigationResult");
                    const predictedTimeEl = document.getElementById("predictedTime");
                    const predictionConfidenceEl = document.getElementById("predictionConfidence");

                    if (resultBox) resultBox.style.display = "block";

                    // Update main prediction display
                    if (predictedTimeEl) predictedTimeEl.innerText = `${data.irrigation_time} mins`;
                    if (predictionConfidenceEl) predictionConfidenceEl.innerText = `${data.confidence}%`;

                    if (resultText) {
                        if (data.motor_status === "ON") {
                            resultText.innerHTML = `
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <span style="color: #2e7d32; font-weight: bold; font-size: 1.1rem;">💧 Motor ON</span>
                                    <span>⏱️ Run motor for <b>${data.irrigation_time} minutes</b></span>
                                    <span>🎯 Confidence: <b>${data.confidence}%</b></span>
                                    <span style="font-size: 0.85rem; color: #666;">Last updated: ${new Date().toLocaleTimeString()}</span>
                                </div>
                            `;
                        } else {
                            resultText.innerHTML = `
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <span style="color: #c62828; font-weight: bold; font-size: 1.1rem;">🚫 Motor OFF</span>
                                    <span>No irrigation needed at this time.</span>
                                    <span style="font-size: 0.85rem; color: #666;">Last updated: ${new Date().toLocaleTimeString()}</span>
                                </div>
                            `;
                        }
                    }

                    if (!isAuto) {
                        btn.innerText = "Predict Irrigation Cycle";
                        btn.disabled = false;
                        this.showNotification("Irrigation prediction complete", "success");
                    } else {
                        // After auto cycle finishes, reset UI
                        resetAutoUI();
                        this.showNotification("Automatic cycle complete", "success");
                    }
                })
                .catch(err => {
                    console.error("Irrigation Fetch Error:", err);
                    if (!isAuto) {
                        alert("Server error while predicting irrigation");
                        btn.innerText = "Predict Irrigation Cycle";
                        btn.disabled = false;
                    } else {
                        resetAutoUI();
                    }
                });
        };

        btn.addEventListener("click", () => performPrediction(false));

        toggleAutoBtn.addEventListener("click", () => {
            if (countdownInterval) {
                // Stop manually
                resetAutoUI();
                this.showNotification("Automatic prediction stopped", "info");
            } else {
                // Start 3-minute cycle
                let timeLeft = AUTO_PREDICT_TIME;
                
                autoBtnText.innerText = "Stop Automatic";
                toggleAutoBtn.style.backgroundColor = "#dc3545";
                const icon = toggleAutoBtn.querySelector('i');
                if (icon) icon.className = "fas fa-stop";
                autoTimerContainer.style.display = "block";
                autoTimer.innerText = timeLeft;

                countdownInterval = setInterval(() => {
                    timeLeft--;
                    autoTimer.innerText = timeLeft;

                    if (timeLeft <= 0) {
                        // Time's up! Trigger prediction and stop
                        clearInterval(countdownInterval);
                        countdownInterval = null;
                        performPrediction(true);
                    }
                }, 1000);

                this.showNotification("3-minute automatic cycle started", "success");
            }
        });
    }


    
    // Scanner Methods
    setupScanner() {
        const captureBtn = document.getElementById('captureBtn');
        const galleryBtn = document.getElementById('galleryBtn');
        const galleryInput = document.getElementById('galleryInput');
        const consultExpertBtn = document.getElementById('consultExpertBtn');
        const buyMedicineBtn = document.getElementById('buyMedicineBtn');
        
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.capturePhoto());
        }
        
        if (galleryBtn) {
            galleryBtn.addEventListener('click', () => {
                if (galleryInput) galleryInput.click();
            });
        }
        
        if (galleryInput) {
            galleryInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.handleImageUpload(e.target.files[0]);
                }
            });
        }

        // NEW: Setup medicine supplier functionality
        if (consultExpertBtn) {
            consultExpertBtn.addEventListener('click', () => this.consultExpert());
        }

        if (buyMedicineBtn) {
            buyMedicineBtn.addEventListener('click', () => this.showMedicineSuppliers());
        }
    }
    
    initScanner() {
        const analysisResults = document.getElementById('analysisResults');
        const capturedImage = document.getElementById('capturedImage');
        const medicineSuppliers = document.getElementById('medicineSuppliers');
        const consultExpertBtn = document.getElementById('consultExpertBtn');
        
        if (analysisResults) analysisResults.style.display = 'none';
        if (capturedImage) capturedImage.style.display = 'none';
        if (medicineSuppliers) medicineSuppliers.style.display = 'none';
        if (consultExpertBtn) consultExpertBtn.style.display = 'inline-flex';
    }
    
    capturePhoto() {
        console.log('Capturing photo');
        const capturedImage = document.getElementById('capturedImage');
        
        if (capturedImage) {
            capturedImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzk0ZDNhMiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXB0dXJlZCBQbGFudCBJbWFnZTwvdGV4dD48L3N2Zz4=';
            capturedImage.style.display = 'block';
            
            this.showNotification('Photo captured! Analyzing...', 'info');
            
            setTimeout(() => {
                this.analyzeImage();
            }, 2000);
        }
    }
   handleImageUpload(file) {
    const capturedImage = document.getElementById("capturedImage");

    const formData = new FormData();
    formData.append("image", file);

    // preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        capturedImage.src = e.target.result;
        capturedImage.style.display = "block";
    };
    reader.readAsDataURL(file);

    // call backend
    fetch("/api/ml/disease-detect", {
    method: "POST",
    body: formData
})
    .then(res => res.json())
    .then(data => {
        console.log("Disease API Response:", data);
        this.showDiseaseResults(data);   // 👈 IMPORTANT
    })
    .catch(err => {
        console.error(err);
        alert("Disease prediction failed");
    });
}

    
   showDiseaseResults(data) {
    const analysisResults = document.getElementById("analysisResults");
    if (!analysisResults) return;

    document.getElementById("detectedDisease").innerText = data.disease;
    document.getElementById("detectionConfidence").innerText =
        data.confidence + "%";

    document.getElementById("affectedArea").innerText =
        data.affected_area;

    document.getElementById("severityLevel").innerText =
        data.severity;

    document.getElementById("primaryMedicine").innerText =
        data.treatment;

    analysisResults.style.display = "block";

    // Hide optional sections
    const medicineSuppliers = document.getElementById('medicineSuppliers');
    if (medicineSuppliers) medicineSuppliers.style.display = 'none';

    analysisResults.style.display = 'block';

    // Optional notification
    if (typeof showNotification === "function") {
        showNotification("Disease analysis complete!", "success");
    }
}


    // NEW: Consult Expert functionality
    consultExpert() {
        this.showNotification('Connecting you with agricultural experts...', 'info');
        
        setTimeout(() => {
            alert('Expert consultation feature coming soon!\n\nYou will be connected with certified agricultural experts for personalized advice on plant disease treatment and prevention.');
        }, 1500);
    }

    // NEW: Show Medicine Suppliers functionality
    showMedicineSuppliers() {
        console.log('Showing medicine suppliers');
        
        const consultExpertBtn = document.getElementById('consultExpertBtn');
        const medicineSuppliers = document.getElementById('medicineSuppliers');
        const suppliersList = document.getElementById('suppliersList');
        
        // Hide the "Consult Expert" button
        if (consultExpertBtn) {
            consultExpertBtn.style.display = 'none';
        }
        
        // Show the medicine suppliers section
        if (medicineSuppliers) {
            medicineSuppliers.style.display = 'block';
        }
        
        // Populate suppliers list
        if (suppliersList) {
            this.renderMedicineSuppliers();
        }
        
        this.showNotification('Finding nearby medicine suppliers...', 'info');
    }

    // NEW: Render Medicine Suppliers
    renderMedicineSuppliers() {
        const suppliersList = document.getElementById('suppliersList');
        if (!suppliersList) return;
        
        suppliersList.innerHTML = '';
        
        this.medicineSuppliers.forEach((supplier, index) => {
            const supplierDiv = document.createElement('div');
            supplierDiv.className = 'supplier-item';
            
            supplierDiv.innerHTML = `
                <div class="supplier-header">
                    <div class="supplier-info">
                        <div class="supplier-name">
                            🏪 ${supplier.name}
                            <span class="supplier-rating">⭐ ${supplier.rating}</span>
                        </div>
                        <div class="supplier-address">📍 ${supplier.address}</div>
                        <div class="supplier-distance">
                            <div class="distance-badge">
                                🚗 ${supplier.distance}
                            </div>
                            <div class="travel-time">~${supplier.travelTime} drive</div>
                        </div>
                    </div>
                </div>
                
                <div class="supplier-availability">
                    <span class="availability-badge ${this.getAvailabilityClass(supplier.availability)}">
                        ${supplier.availability}
                    </span>
                </div>
                
                <div class="supplier-medicines">
                    <h5>Available Medicines:</h5>
                    <div class="medicines-list">
                        ${supplier.medicines.map(medicine => 
                            `<span class="medicine-tag">${medicine}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="supplier-hours">
                    🕐 Open: ${supplier.openHours}
                </div>
                
                <div class="supplier-actions">
                    <button class="btn btn--call" data-phone="${supplier.phone}">
                        📞 Call Now
                    </button>
                    <button class="btn btn--directions" data-name="${supplier.name}" data-address="${supplier.address}">
                        🧭 Get Directions
                    </button>
                </div>
            `;
            
            suppliersList.appendChild(supplierDiv);
        });

        // Add event listeners to the buttons
        this.setupSupplierButtons();
    }

    setupSupplierButtons() {
        const callButtons = document.querySelectorAll('.btn--call');
        const directionButtons = document.querySelectorAll('.btn--directions');

        callButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const phone = e.target.getAttribute('data-phone');
                this.callSupplier(phone);
            });
        });

        directionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-name');
                const address = e.target.getAttribute('data-address');
                this.getDirections(name, address);
            });
        });
    }

    // NEW: Get availability CSS class
    getAvailabilityClass(availability) {
        switch (availability.toLowerCase()) {
            case 'in stock': return 'in-stock';
            case 'limited stock': return 'limited-stock';
            case 'out of stock': return 'out-stock';
            default: return 'in-stock';
        }
    }

    // NEW: Call Supplier
    callSupplier(phoneNumber) {
        console.log('Calling supplier:', phoneNumber);
        
        this.showNotification(`Calling ${phoneNumber}...`, 'info');
        
        setTimeout(() => {
            if (confirm(`Call ${phoneNumber}?\n\nThis will open your phone app to make the call.`)) {
                window.open(`tel:${phoneNumber}`, '_blank');
            }
        }, 500);
    }

    // NEW: Get Directions
    getDirections(supplierName, address) {
        console.log('Getting directions to:', supplierName, address);
        
        this.showNotification(`Opening directions to ${supplierName}...`, 'info');
        
        setTimeout(() => {
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
            window.open(mapsUrl, '_blank');
        }, 500);
    }
    
    // Daily Tasks Methods
    setupDailyTasks() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.addNewTask());
        }
    }
    
    initDailyTasksPage() {
        this.renderTasks();
        this.updateTaskSummary();
    }
    
    renderTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        taskList.innerHTML = '';
        
        this.dailyTasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            taskDiv.innerHTML = `
                <div class="task-header" style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           data-task-id="${task.id}" style="transform: scale(1.2);">
                    <span class="task-text" style="flex: 1; font-weight: 500;">${task.task}</span>
                    <span class="task-priority ${task.priority}" style="padding: 4px 8px; border-radius: 12px; font-size: 11px; text-transform: uppercase; color: white; background: ${this.getPriorityColor(task.priority)};">${task.priority}</span>
                </div>
            `;
            
            taskList.appendChild(taskDiv);
        });

        // Add event listeners to checkboxes
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.getAttribute('data-task-id'));
                this.toggleTask(taskId);
            });
        });
    }
    
    getPriorityColor(priority) {
        const colors = { high: '#DC3545', medium: '#FFA500', low: '#6BB66B' };
        return colors[priority] || '#FFA500';
    }
    
    toggleTask(taskId) {
        const task = this.dailyTasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
            this.updateTaskSummary();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }
    
    updateTaskSummary() {
        const completed = this.dailyTasks.filter(t => t.completed).length;
        const pending = this.dailyTasks.filter(t => !t.completed).length;
        const highPriority = this.dailyTasks.filter(t => t.priority === 'high' && !t.completed).length;
        
        const updates = {
            completedTasks: completed,
            pendingTasks: pending,
            highPriorityTasks: highPriority
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    addNewTask() {
        const taskText = prompt('Enter new task:');
        if (taskText && taskText.trim()) {
            const newTask = {
                id: Date.now(),
                task: taskText.trim(),
                priority: 'medium',
                completed: false
            };
            
            this.dailyTasks.push(newTask);
            this.renderTasks();
            this.updateTaskSummary();
            this.showNotification('New task added!', 'success');
        }
    }
    
    // Location and Sensors
    initLocationPage() {
        // Setup map interactions
    }
    
    setupMapControls() {
        // Map controls setup
    }
    
    initSensorsPage() {
        this.updateDetailSensors();
        setTimeout(() => this.initHistoricalChart(), 200);
    }
    
    updateDetailSensors() {
        Object.entries(this.sensorData).forEach(([key, value]) => {
            const elementId = `detail${key.charAt(0).toUpperCase() + key.slice(1)}Percent`;
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value + '%';
            }
        });
    }
    
    initHistoricalChart() {
        const canvas = document.getElementById('historicalChart');
        if (canvas && typeof Chart !== 'undefined') {
            const ctx = canvas.getContext('2d');
            
            if (this.charts.historical) {
                this.charts.historical.destroy();
            }
            
            this.charts.historical = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                    datasets: [
                        {
                            label: 'Soil Moisture',
                            data: this.generateHistoricalData(this.sensorData.soilMoisture),
                            borderColor: '#7CB97C',
                            backgroundColor: 'rgba(124, 185, 124, 0.1)',
                            fill: true
                        },
                        {
                            label: 'Humidity',
                            data: this.generateHistoricalData(this.sensorData.humidity),
                            borderColor: '#4FC3F7',
                            backgroundColor: 'rgba(79, 195, 247, 0.1)',
                            fill: true
                        },
                        {
                            label: 'Temperature',
                            data: this.generateHistoricalData(this.sensorData.temperature),
                            borderColor: '#FF9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Percentage (%)'
                            }
                        }
                    }
                }
            });
        }
    }
    
    generateHistoricalData(baseValue) {
        const data = [];
        for (let i = 0; i < 7; i++) {
            const variation = (Math.random() - 0.5) * 10;
            data.push(Math.max(0, Math.min(100, baseValue + variation)));
        }
        return data;
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: white;
            border: 2px solid #6BB66B;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 300px;
            font-size: 14px;
            color: #6BB66B;
            font-weight: 500;
        `;
        
        if (type === 'error') {
            notification.style.borderColor = '#DC3545';
            notification.style.color = '#DC3545';
        } else if (type === 'warning') {
            notification.style.borderColor = '#FFA500';
            notification.style.color = '#FFA500';
        } else if (type === 'info') {
            notification.style.borderColor = '#4FC3F7';
            notification.style.color = '#4FC3F7';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    logout() {
        console.log('Logging out');
        auth.signOut().then(() => {
            // Clear local session data
            localStorage.removeItem('lastPage');
            this.currentUser = null;
            this.clearIntervals();
            this.navigateToPage('loginPage');
        }).catch(err => {
            console.error('Logout error:', err);
            alert('Logout failed');
        });
    }

    clearIntervals() {
        this.sensorIntervals.forEach(interval => clearInterval(interval));
        this.sensorIntervals = [];
    }
    
    saveSession() {
        window.smartFarmSession = this.currentUser;
    }
    
    checkExistingSession() {
        if (window.smartFarmSession) {
            this.currentUser = window.smartFarmSession;
            this.showMainDashboard();
            return true;
        }
        return false;
    }
    
    logout() {
        this.currentUser = null;
        window.smartFarmSession = null;
        this.clearIntervals();
        this.hideBottomNav();
        
        document.querySelectorAll('form').forEach(form => form.reset());
        this.navigateToPage('loginPage');
        this.showNotification('Logged out successfully', 'success');
    }
}

// Initialize app
let appInstance;

// Ensure app initializes properly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    console.log('Initializing Smart Farm App');
    appInstance = new SmartFarmApp();
    window.appInstance = appInstance;
}

// Global function for task checkboxes - deprecated, now using direct event listeners
window.toggleTask = function(taskId) {
    if (window.appInstance) {
        window.appInstance.toggleTask(taskId);
    }
};