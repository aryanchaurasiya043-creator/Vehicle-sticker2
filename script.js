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
                this.filterStickersByCategory(category);
            });
        });

        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('designer');
            });
        }
    }

    setupUserImageUpload() {
        const dropZone = document.getElementById('user-drop-zone');
        const fileInput = document.getElementById('user-file-input');
        const browseBtn = document.getElementById('browse-user-image');

        if (!dropZone || !fileInput || !browseBtn) return;

        const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(evt => {
            dropZone.addEventListener(evt, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt && dt.files ? dt.files : [];
            if (files && files[0]) this.handleUserImageFile(files[0]);
        });

        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                this.handleUserImageFile(fileInput.files[0]);
                fileInput.value = '';
            }
        });
    }

    handleUserImageFile(file) {
        if (!file || !this.canvas) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload an image file (PNG, JPG, SVG, or WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result.toString();
            if (!dataUrl) return;

            if (file.type === 'image/svg+xml') {
                fabric.loadSVGFromURL(dataUrl, (objects, options) => {
                    const group = fabric.util.groupSVGElements(objects, options);
                    this.positionAndScaleObjectToVehicle(group);
                });
            } else {
                fabric.Image.fromURL(dataUrl, (img) => {
                    this.positionAndScaleObjectToVehicle(img);
                }, { crossOrigin: 'anonymous' });
            }
        };
        reader.readAsDataURL(file);
    }

    positionAndScaleObjectToVehicle(obj) {
        if (!this.canvas || !obj) return;

        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const targetWidth = canvasWidth * 0.6;
        const targetHeight = canvasHeight * 0.4;

        let objWidth = obj.width || (obj.getScaledWidth ? obj.getScaledWidth() : 0);
        let objHeight = obj.height || (obj.getScaledHeight ? obj.getScaledHeight() : 0);

        if ((!objWidth || !objHeight) && obj.getBoundingRect) {
            const bounds = obj.getBoundingRect(true);
            objWidth = bounds.width;
            objHeight = bounds.height;
        }

        if (!objWidth || !objHeight) obj.scale(1);
        else {
            const scaleX = targetWidth / objWidth;
            const scaleY = targetHeight / objHeight;
            const scale = Math.min(scaleX, scaleY, 1.5);
            obj.scale(scale);
        }

        obj.set({
            left: canvasWidth / 2,
            top: canvasHeight * 0.55,
            originX: 'center',
            originY: 'center',
            cornerSize: 10,
            cornerColor: '#6366f1',
            cornerStyle: 'circle',
            transparentCorners: false,
            borderColor: '#6366f1',
            borderScaleFactor: 2
        });

        this.canvas.add(obj);
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
    }

    loadStickers() {
        this.stickers = [
            { id: 1, name: 'Speed Demon', category: 'cars', image: 'stickers/car-sticker-1.svg' },
            { id: 2, name: 'Classic Car', category: 'cars', image: 'stickers/car-sticker-2.svg' },
            { id: 3, name: 'Modern Sport', category: 'cars', image: 'stickers/car-sticker-3.svg' },
            { id: 4, name: 'Biker Gang', category: 'bikes', image: 'stickers/bike-sticker-1.svg' },
            { id: 5, name: 'Speed Bike', category: 'bikes', image: 'stickers/bike-sticker-2.svg' },
            { id: 6, name: 'Vintage Bike', category: 'bikes', image: 'stickers/bike-sticker-3.svg' },
            { id: 7, name: 'Big Rig', category: 'trucks', image: 'stickers/truck-sticker-1.svg' },
            { id: 8, name: 'Pickup Power', category: 'trucks', image: 'stickers/truck-sticker-2.svg' },
            { id: 9, name: 'Monster Truck', category: 'trucks', image: 'stickers/truck-sticker-3.svg' },
            { id: 10, name: 'Custom Design 1', category: 'custom', image: 'stickers/custom-sticker-1.svg' }
        ];
    }

    loadGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';
        this.stickers.forEach(sticker => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `<img src="${sticker.image}" alt="${sticker.name}" draggable="true">`;
            
            galleryItem.querySelector('img').addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('sticker', sticker.image);
            });

            galleryItem.addEventListener('click', () => {
                this.showSection('designer');
                this.addStickerToCanvas(sticker.image);
            });

            galleryGrid.appendChild(galleryItem);
        });

        // Enable drop on canvas
        const canvasEl = this.canvas.getElement();
        canvasEl.addEventListener('dragover', (e) => e.preventDefault());
        canvasEl.addEventListener('drop', (e) => {
            e.preventDefault();
            const stickerUrl = e.dataTransfer.getData('sticker');
            if (stickerUrl) this.addStickerToCanvasAtPosition(stickerUrl, e.offsetX, e.offsetY);
        });
    }

    filterStickersByCategory(category) {
        const filtered = this.stickers.filter(s => s.category === category);
        this.renderStickerGallery(filtered);
    }

    renderStickerGallery(stickers = this.stickers) {
        const stickerGallery = document.getElementById('sticker-gallery');
        if (!stickerGallery) return;
        stickerGallery.innerHTML = '';

        stickers.forEach(sticker => {
            const stickerItem = document.createElement('div');
            stickerItem.className = 'sticker-item';
            stickerItem.innerHTML = `<img src="${sticker.image}" alt="${sticker.name}" draggable="true">`;

            stickerItem.querySelector('img').addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('sticker', sticker.image);
            });

            stickerItem.addEventListener('click', () => this.addStickerToCanvas(sticker.image));
            stickerGallery.appendChild(stickerItem);
        });
    }

    initializeCanvas() {
        const canvasEl = document.getElementById('design-canvas');
        if (!canvasEl) return;

        if (this.canvas) this.canvas.dispose();

        this.canvas = new fabric.Canvas('design-canvas', {
            width: 800,
            height: 600,
            backgroundColor: '#f8fafc',
            selection: true,
            preserveObjectStacking: true
        });

        this.loadVehicleImage();
        this.setupCanvasEvents();
        this.renderStickerGallery();
    }

    loadVehicleImage() {
        if (!this.canvas) return;

        const existingVehicle = this.canvas.getObjects().find(o => o.isVehicle);
        if (existingVehicle) this.canvas.remove(existingVehicle);

        const placeholderSvg = this.createVehiclePlaceholder(this.currentVehicle);
        fabric.loadSVGFromString(placeholderSvg, (objects, options) => {
            const vehicleGroup = fabric.util.groupSVGElements(objects, options);
            vehicleGroup.set({ left: 400, top: 300, originX: 'center', originY: 'center', scaleX: 2, scaleY: 2, isVehicle: true, selectable: false, evented: false });
            this.canvas.add(vehicleGroup);
            this.canvas.sendToBack(vehicleGroup);
            this.canvas.renderAll();
        });
    }

    createVehiclePlaceholder(type) {
        const svgs = {
            car: `<svg width="100" height="50"><rect x="10" y="20" width="80" height="20" fill="#374151" rx="2"/></svg>`,
            bike: `<svg width="100" height="50"><circle cx="20" cy="35" r="12" fill="#374151"/></svg>`,
            truck: `<svg width="100" height="50"><rect x="10" y="25" width="40" height="20" fill="#374151"/></svg>`
        };
        return svgs[type] || svgs.car;
    }

    setupCanvasEvents() {
        if (!this.canvas) return;

        this.canvas.on('selection:created', (e) => this.updateObjectControls(e.selected));
        this.canvas.on('selection:updated', (e) => this.updateObjectControls(e.selected));
        this.canvas.on('selection:cleared', () => this.hideObjectControls());
        this.canvas.on('object:modified', () => this.canvas.renderAll());
    }

    addStickerToCanvas(imageUrl) {
        if (!this.canvas) return;
        fabric.Image.fromURL(imageUrl, (img) => {
            img.set({ left: 400, top: 300, originX: 'center', originY: 'center', scaleX: 0.8, scaleY: 0.8, cornerSize: 10, cornerColor: '#6366f1', cornerStyle: 'circle', transparentCorners: false, borderColor: '#6366f1', borderScaleFactor: 2 });
            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            this.canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    addStickerToCanvasAtPosition(imageUrl, x, y) {
        if (!this.canvas) return;
        fabric.Image.fromURL(imageUrl, (img) => {
            img.set({ left: x, top: y, originX: 'center', originY: 'center', scaleX: 0.8, scaleY: 0.8, cornerSize: 10, cornerColor: '#6366f1', cornerStyle: 'circle', transparentCorners: false, borderColor: '#6366f1', borderScaleFactor: 2 });
            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            this.canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    addTextToCanvas() {
        if (!this.canvas) return;
        const textInput = document.getElementById('text-input');
        const fontSelect = document.getElementById('font-select');
        const textColor = document.getElementById('text-color');
        const textSize = document.getElementById('text-size');

        const text = textInput.value.trim();
        if (!text) return alert('Please enter some text first!');

        const txt = new fabric.Text(text, { left: 400, top: 300, originX: 'center', originY: 'center', fontFamily: fontSelect.value, fontSize: parseInt(textSize.value), fill: textColor.value, cornerSize: 10, cornerColor: '#6366f1', cornerStyle: 'circle', transparentCorners: false, borderColor: '#6366f1', borderScaleFactor: 2 });
        this.canvas.add(txt);
        this.canvas.setActiveObject(txt);
        this.canvas.renderAll();
        textInput.value = '';
    }

    updateObjectControls(selectedObjects) { if (!selectedObjects || !selectedObjects.length) return; const activeObject = selectedObjects[0]; if (activeObject.type === 'text') this.showTextControls(activeObject); else this.hideTextControls(); }
    showTextControls(textObject) { const fontSelect = document.getElementById('font-select'); const textColor = document.getElementById('text-color'); const textSize = document.getElementById('text-size'); if (fontSelect) fontSelect.value = textObject.fontFamily; if (textColor) textColor.value = textObject.fill; if (textSize) textSize.value = textObject.fontSize; const updateText = () => { textObject.set({ fontFamily: fontSelect.value, fill: textColor.value, fontSize: parseInt(textSize.value) }); this.canvas.renderAll(); }; fontSelect.onchange = textColor.onchange = textSize.onchange = updateText; }
    hideTextControls() { const fontSelect = document.getElementById('font-select'); const textColor = document.getElementById('text-color'); const textSize = document.getElementById('text-size'); if (fontSelect) fontSelect.onchange = null; if (textColor) textColor.onchange = null; if (textSize) textSize.onchange = null; }
    hideObjectControls() { this.hideTextControls(); }

    clearCanvas() { if (!this.canvas) return; if (confirm('Are you sure you want to clear all objects from the canvas?')) { this.canvas.clear(); this.loadVehicleImage(); } }

    downloadDesign() { if (!this.canvas) return; const scale = 2; const dataURL = this.canvas.toDataURL({ format: 'png', quality: 1, multiplier: scale }); const link = document.createElement('a'); link.download = `vehicle-sticker-${Date.now()}.png`; link.href = dataURL; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => { window.stickerDesigner = new StickerDesigner(); });
