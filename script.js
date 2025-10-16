// Vehicle Sticker Designer - Complete JavaScript

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
        this.loadStickers();
        this.loadGallery();
        this.initializeCanvas();
        this.setupUserImageUpload();
        this.setupControls();
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
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            if (sectionId === 'designer') setTimeout(() => this.initializeCanvas(), 100);
        }
    }

    setupControls() {
        document.getElementById('download-btn')?.addEventListener('click', () => this.downloadDesign());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearCanvas());
        document.getElementById('add-text-btn')?.addEventListener('click', () => this.addTextToCanvas());

        document.querySelectorAll('.vehicle-option').forEach(option => {
            option.addEventListener('click', () => {
                this.currentVehicle = option.dataset.vehicle;
                this.loadVehicleImage();
            });
        });

        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showSection('designer');
                this.filterStickersByCategory(card.dataset.category);
            });
        });
    }

    loadStickers() {
        this.stickers = [
            {id:1,name:'Speed Demon',category:'cars',image:'stickers/car-sticker-1.svg'},
            {id:2,name:'Classic Car',category:'cars',image:'stickers/car-sticker-2.svg'},
            {id:3,name:'Modern Sport',category:'cars',image:'stickers/car-sticker-3.svg'},
            {id:4,name:'Biker Gang',category:'bikes',image:'stickers/bike-sticker-1.svg'},
            {id:5,name:'Speed Bike',category:'bikes',image:'stickers/bike-sticker-2.svg'},
            {id:6,name:'Vintage Bike',category:'bikes',image:'stickers/bike-sticker-3.svg'},
            {id:7,name:'Big Rig',category:'trucks',image:'stickers/truck-sticker-1.svg'},
            {id:8,name:'Pickup Power',category:'trucks',image:'stickers/truck-sticker-2.svg'},
            {id:9,name:'Monster Truck',category:'trucks',image:'stickers/truck-sticker-3.svg'}
        ];
    }

    loadGallery() {
        const gallery = document.getElementById('gallery-grid');
        if (!gallery) return;
        gallery.innerHTML = '';
        this.stickers.forEach(sticker => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `<img src="${sticker.image}" alt="${sticker.name}">
                             <h4>${sticker.name}</h4>`;
            div.addEventListener('click', () => {
                this.showSection('designer');
                this.addStickerToCanvas(sticker.image);
            });
            gallery.appendChild(div);
        });
    }

    filterStickersByCategory(category) {
        const filtered = this.stickers.filter(s => s.category === category);
        this.renderStickerGallery(filtered);
    }

    renderStickerGallery(stickers=this.stickers) {
        const stickerGallery = document.getElementById('sticker-gallery');
        if (!stickerGallery) return;
        stickerGallery.innerHTML = '';
        stickers.forEach(s => {
            const div = document.createElement('div');
            div.className = 'sticker-item';
            div.innerHTML = `<img src="${s.image}" alt="${s.name}">`;
            div.addEventListener('click', () => this.addStickerToCanvas(s.image));
            stickerGallery.appendChild(div);
        });
    }

    initializeCanvas() {
        const canvasEl = document.getElementById('design-canvas');
        if (!canvasEl) return;
        if (this.canvas) this.canvas.dispose();
        this.canvas = new fabric.Canvas('design-canvas', {width:800, height:600, backgroundColor:'#f8fafc', selection:true});
        this.loadVehicleImage();
    }

    loadVehicleImage() {
        if (!this.canvas) return;
        const placeholder = `<svg width="100" height="50"><rect width="100" height="50" fill="#ccc"/></svg>`;
        fabric.loadSVGFromString(placeholder, (objects, options) => {
            const group = fabric.util.groupSVGElements(objects, options);
            group.set({left:400, top:300, originX:'center', originY:'center', selectable:false, evented:false});
            this.canvas.add(group);
            this.canvas.sendToBack(group);
        });
    }

    addStickerToCanvas(url) {
        if (!this.canvas) return;
        fabric.Image.fromURL(url, img => {
            img.set({left:400, top:300, originX:'center', originY:'center', cornerSize:10});
            this.canvas.add(img);
            this.canvas.setActiveObject(img);
        }, {crossOrigin:'anonymous'});
    }

    addTextToCanvas() {
        if (!this.canvas) return;
        const text = document.getElementById('text-input').value.trim();
        if (!text) return alert('Enter text!');
        const obj = new fabric.Text(text, {left:400, top:300, originX:'center', originY:'center', fontSize:30, fill:'#000'});
        this.canvas.add(obj);
        this.canvas.setActiveObject(obj);
    }

    clearCanvas() {
        if (!this.canvas) return;
        if (confirm('Clear canvas?')) this.canvas.clear();
        this.loadVehicleImage();
    }

    downloadDesign() {
        if (!this.canvas) return;
        const dataURL = this.canvas.toDataURL({format:'png', quality:1});
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `sticker-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setupUserImageUpload() {
        const dropZone = document.getElementById('user-drop-zone');
        const fileInput = document.getElementById('user-file-input');
        const browseBtn = document.getElementById('browse-user-image');

        if (!dropZone || !fileInput || !browseBtn) return;

        const preventDefaults = e => { e.preventDefault(); e.stopPropagation(); };
        ['dragenter','dragover','dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, preventDefaults));
        ['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.add('dragover')));
        ['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('dragover')));

        dropZone.addEventListener('drop', e => {
            const files = e.dataTransfer.files;
            if (files && files[0]) this.handleUserImageFile(files[0]);
        });

        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => { if (fileInput.files[0]) this.handleUserImageFile(fileInput.files[0]); fileInput.value=''; });
    }

    handleUserImageFile(file) {
        if (!this.canvas || !file) return;
        const reader = new FileReader();
        reader.onload = e => {
            fabric.Image.fromURL(e.target.result, img => {
                img.set({left:400, top:300, originX:'center', originY:'center', cornerSize:10});
                this.canvas.add(img);
                this.canvas.setActiveObject(img);
            }, {crossOrigin:'anonymous'});
        };
        reader.readAsDataURL(file);
    }
}

const stickerDesigner = new StickerDesigner();
