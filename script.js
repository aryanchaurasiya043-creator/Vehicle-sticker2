// Main script - StickerDesigner (complete, ready-to-run)
// Make sure fabric.js is loaded before this script (index.html includes CDN).

class StickerDesigner {
  constructor() {
    this.canvas = null;
    this.currentVehicle = 'car';
    this.stickers = [];
    this.vehicleImages = {
      car: 'images/bike-sticker-2.svg',
      bike: 'images/vehicle-bike.svg',
      truck: 'images/vehicle-truck.svg'
    };

    window.stickerDesigner = this;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadStickers();
    this.loadGallery();
    this.initializeCanvas();
    this.setupUserImageUpload();
  }

  setupEventListeners() {
    // Anchor links to switch sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
          target.classList.add('active');
          if (target.id === 'designer') setTimeout(() => this.initializeCanvas(), 100);
        }
      });
    });

    // Buttons
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');
    const addTextBtn = document.getElementById('add-text-btn');

    if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadDesign());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearCanvas());
    if (addTextBtn) addTextBtn.addEventListener('click', () => this.addTextToCanvas());
  }

  loadStickers() {
    // replace/add your own sticker URLs here
    this.stickers = [
      { id: 1, name: 'Red Car Top', category: 'cars', image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Red_car_top_view.svg' },
      { id: 2, name: 'Motorbike Icon', category: 'bikes', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Motorbike_icon.svg' },
      { id: 3, name: 'Lightning Bolt', category: 'custom', image: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Lightning_bolt.svg' },
      { id: 4, name: 'Demo Logo', category: 'custom', image: 'https://i.imgur.com/DS4Yy6v.png' }
    ];
  }

  loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    this.stickers.forEach(sticker => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${sticker.image}" alt="${sticker.name}" onerror="this.style.background='#eee'; this.alt='sticker'">
        <h4 style="margin:8px 0 6px 0">${sticker.name}</h4>
        <p style="margin:0;color:rgba(255,255,255,0.7);font-size:0.85rem">${sticker.category}</p>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const designer = document.getElementById('designer');
        if (designer) designer.classList.add('active');
        this.addStickerToCanvas(sticker.image);
        setTimeout(()=> this.initializeCanvas(), 50);
      });
      galleryGrid.appendChild(card);
    });
  }

  renderStickerGallery(stickers = this.stickers) {
    const stickerGallery = document.getElementById('sticker-gallery');
    if (!stickerGallery) return;
    stickerGallery.innerHTML = '';

    stickers.forEach(s => {
      const item = document.createElement('div');
      item.className = 'sticker-item';
      item.innerHTML = `<img src="${s.image}" alt="${s.name}" onerror="this.style.background='#eee'">`;
      item.addEventListener('click', () => this.addStickerToCanvas(s.image));
      stickerGallery.appendChild(item);
    });
  }

  initializeCanvas() {
    const canvasElement = document.getElementById('design-canvas');
    if (!canvasElement) return;

    if (this.canvas) {
      this.canvas.dispose();
    }

    // set canvas size
    canvasElement.width = 800;
    canvasElement.height = 500;

    this.canvas = new fabric.Canvas('design-canvas', {
      width: canvasElement.width,
      height: canvasElement.height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    });

    // load vehicle placeholder
    this.loadVehicleImage();

    // events
    this.setupCanvasEvents();

    // fill sticker thumbnails panel
    this.renderStickerGallery();

    // Auto-add demo sticker if canvas contains no user objects (only vehicle)
    setTimeout(() => {
      const nonVehicleObjects = this.canvas.getObjects().filter(o => !o.isVehicle);
      if (nonVehicleObjects.length === 0) {
        this.addStickerToCanvas('https://i.imgur.com/DS4Yy6v.png');
      }
    }, 400);
  }

  loadVehicleImage() {
    if (!this.canvas) return;

    // remove existing vehicle
    const existing = this.canvas.getObjects().find(o => o.isVehicle);
    if (existing) this.canvas.remove(existing);

    const placeholderSvg = this.createVehiclePlaceholder(this.currentVehicle);
    fabric.loadSVGFromString(placeholderSvg, (objects, options) => {
      const vehicleGroup = fabric.util.groupSVGElements(objects, options);
      vehicleGroup.set({
        left: this.canvas.getWidth()/2,
        top: this.canvas.getHeight()/2.2,
        originX: 'center',
        originY: 'center',
        scaleX: 3,
        scaleY: 3,
        selectable: false,
        evented: false,
        isVehicle: true
      });
      this.canvas.add(vehicleGroup);
      this.canvas.sendToBack(vehicleGroup);
      this.canvas.renderAll();
    });
  }

  createVehiclePlaceholder(type) {
    const templates = {
      car: `<svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="80" height="20" fill="#374151" rx="2"/>
              <rect x="15" y="15" width="70" height="10" fill="#4B5563" rx="1"/>
              <circle cx="25" cy="45" r="8" fill="#6B7280"/>
              <circle cx="75" cy="45" r="8" fill="#6B7280"/>
            </svg>`,
      bike: `<svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="35" r="12" fill="#374151"/>
              <circle cx="80" cy="35" r="12" fill="#374151"/>
              <line x1="20" y1="35" x2="80" y2="35" stroke="#374151" stroke-width="3"/>
            </svg>`,
      truck:`<svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="25" width="40" height="20" fill="#374151" rx="2"/>
              <rect x="50" y="20" width="40" height="25" fill="#4B5563" rx="2"/>
              <circle cx="25" cy="50" r="8" fill="#6B7280"/>
              <circle cx="75" cy="50" r="8" fill="#6B7280"/>
            </svg>`
    };
    return templates[type] || templates.car;
  }

  setupCanvasEvents() {
    if (!this.canvas) return;
    this.canvas.on('object:modified', () => this.canvas.renderAll());
    // Enable touch gestures for mobile transform (fabric has built-in support)
  }

  addStickerToCanvas(imageUrl) {
    if (!this.canvas) return;
    const isSvg = typeof imageUrl === 'string' && imageUrl.trim().toLowerCase().endsWith('.svg');

    if (isSvg) {
      fabric.loadSVGFromURL(imageUrl, (objects, options) => {
        const group = fabric.util.groupSVGElements(objects, options);
        this.positionAndScaleObjectToVehicle(group);
      }, (err) => {
        console.warn('SVG load failed:', err);
        this.addPlaceholderSticker();
      });
    } else {
      fabric.Image.fromURL(imageUrl, (img) => {
        img.set({ crossOrigin: 'anonymous' });
        // If image is huge, limit maximum scale in positionAndScaleObjectToVehicle
        this.positionAndScaleObjectToVehicle(img);
      }, { crossOrigin: 'anonymous' });
    }
  }

  addPlaceholderSticker() {
    const placeholderSvg = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="60" rx="8" fill="#F3F4F6"/>
      <rect x="10" y="10" width="40" height="40" rx="4" fill="#E5E7EB"/>
      <text x="30" y="36" font-family="Arial" font-size="12" fill="#9CA3AF" text-anchor="middle">Sticker</text>
    </svg>`;
    fabric.loadSVGFromString(placeholderSvg, (objects, options) => {
      const group = fabric.util.groupSVGElements(objects, options);
      this.positionAndScaleObjectToVehicle(group);
    });
  }

  positionAndScaleObjectToVehicle(obj) {
    if (!this.canvas || !obj) return;

    const cw = this.canvas.getWidth();
    const ch = this.canvas.getHeight();
    const targetW = cw * 0.5;
    const targetH = ch * 0.35;

    let ow = obj.width || (obj.getScaledWidth ? obj.getScaledWidth() : 0);
    let oh = obj.height || (obj.getScaledHeight ? obj.getScaledHeight() : 0);

    if ((!ow || !oh) && obj.getBoundingRect) {
      const b = obj.getBoundingRect(true);
      ow = b.width; oh = b.height;
    }

    if (!ow || !oh) obj.scale(1);
    else {
      const sx = targetW / ow;
      const sy = targetH / oh;
      const scale = Math.min(sx, sy, 1.5);
      obj.scale(scale);
    }

    obj.set({
      left: cw / 2,
      top: ch * 0.55,
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
    const valid = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!valid.includes(file.type)) {
      alert('Please upload PNG, JPG, SVG or WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target && e.target.result ? e.target.result.toString() : '';
      if (!dataUrl) return;

      if (file.type === 'image/svg+xml') {
        fabric.loadSVGFromString(dataUrl, (objects, options) => {
          const group = fabric.util.groupSVGElements(objects, options);
          this.positionAndScaleObjectToVehicle(group);
        });
      } else {
        fabric.Image.fromURL(dataUrl, (img) => {
          img.set({ crossOrigin: 'anonymous' });
          this.positionAndScaleObjectToVehicle(img);
        }, { crossOrigin: 'anonymous' });
      }
    };
    reader.readAsDataURL(file);
  }

  addTextToCanvas() {
    if (!this.canvas) return;
    const textInput = document.getElementById('text-input');
    const fontSelect = document.getElementById('font-select');
    const textColor = document.getElementById('text-color');
    const textSize = document.getElementById('text-size');

    const text = (textInput && textInput.value) ? textInput.value.trim() : '';
    if (!text) { alert('Please enter text first!'); return; }

    const textObj = new fabric.Text(text, {
      left: this.canvas.getWidth()/2,
      top: this.canvas.getHeight()/2,
      originX: 'center',
      originY: 'center',
      fontFamily: fontSelect ? fontSelect.value : 'Arial',
      fontSize: textSize ? parseInt(textSize.value,10) : 28,
      fill: textColor ? textColor.value : '#111827',
      cornerSize: 10,
      cornerColor: '#6366f1',
      cornerStyle: 'circle',
      transparentCorners: false,
      borderColor: '#6366f1',
      borderScaleFactor: 2
    });

    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    this.canvas.renderAll();

    if (textInput) textInput.value = '';
  }

  clearCanvas() {
    if (!this.canvas) return;
    if (!confirm('Are you sure you want to clear the canvas?')) return;
    this.canvas.clear();
    this.loadVehicleImage();
  }

  downloadDesign() {
    if (!this.canvas) return;
    const multiplier = 2;
    const dataURL = this.canvas.toDataURL({ format: 'png', quality: 1, multiplier });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `vehicle-sticker-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new StickerDesigner();
});
