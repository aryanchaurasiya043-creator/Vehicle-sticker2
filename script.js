// Vehicle Sticker Designer - Full JavaScript File with Drag & Drop
// Handles all interactive functionality including canvas, stickers, text, drag & drop

class StickerDesigner {
    constructor() {
        this.canvas = null;
        this.currentVehicle = 'car';
        this.stickers = [];
        this.vehicleImages = {
            car: 'images/vehicle-car.svg',
            bike: 'images/vehicle-bike.svg',
            truck: 'images/vehicle-truck.svg'
        };
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadStickers();
        this.loadGallery();
        this.initializeCanvas();
        this.setupUserImageUpload();
    }

    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            if (sectionId === 'designer') {
                setTimeout(() => this.initializeCanvas(), 100);
            }
        }
    }

    setupEventListeners() {
        const vehicleOptions = document.querySelectorAll('.vehicle-option');
        vehicleOptions.forEach(option => {
            option.addEventListener('click', () => {
                vehicleOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.currentVehicle = option.dataset.vehicle;
                this.loadVehicleImage();
            });
        });

        const downloadBtn = document.getElementById('download-btn');
        const clearBtn = document.getElementById('clear-btn');
        const addTextBtn = document.getElementById('add-text-btn');

        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadDesign());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearCanvas());
        if (addTextBtn) addTextBtn.addEventListener('click', () => this.addTextToCanvas());

        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.showSection('designer');
                this.filterStickersByCategor
