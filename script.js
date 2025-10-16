class StickerDesigner {
  constructor() {
    this.canvas = null;
    this.currentVehicle = 'car';
    this.stickers = [
      { name: 'Red Car', image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Red_car_top_view.svg' },
      { name: 'Motorbike', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Motorbike_icon.svg' },
      { name: 'Lightning', image: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Lightning_bolt.svg' },
      { name: 'Star', image: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Five-pointed_star.svg' },
      { name: 'Heart', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Heart_corazón.svg' },
      { name: 'Fire', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Emoji_u1f525.svg' }
    ];

    this.vehicleSVGs = {
      car: `<svg width="100" height="50" viewBox="0 0 100 50"><rect x="10" y="20" width="80" height="20" fill="#374151" rx="2"/><rect x="15" y="15" width="70" height="10" fill="#4B5563" rx="1"/><circle cx="25" cy="45" r="8" fill="#6B7280"/><circle cx="75" cy="45" r="8" fill="#6B7280"/></svg>`,
      bike: `<svg width="100" height="50" viewBox="0 0 100 50"><circle cx="20" cy="35" r="12" fill="#374151"/><circle cx="80" cy="35" r="12" fill="#374151"/><line x1="20" y1="35" x2="80" y2="35" stroke="#374151" stroke-width="3"/></svg>`,
      truck: `<svg width="100" height="50" viewBox="0 0 100 50"><rect x="10" y="25" width="40" height="20" fill="#374151"/><rect x="50" y="20" width="40" height="25" fill="#4B5563"/><circle cx="25" cy="50" r="8" fill="#6B7280"/><circle cx="75" cy="50" r="8" fill="#6B7280"/></svg>`
    };

    this.init();
  }

  init() {
    this.canvas = new fabric.Canvas('design-canvas', { width: 900, height: 400, backgroundColor: '#f8fafc' });
    this.loadVehicle();
    this.renderGallery();
    this.setupVehicleButtons();
    this.setupControls();
  }

  loadVehicle() {
    const svgStr = this.vehicleSVGs[this.currentVehicle];
    fabric.loadSVGFromString(svgStr, (objects, options) => {
      const vehicle = fabric.util.groupSVGElements(objects, options);
      vehicle.set({ left: 450, top: 200, originX: 'center', originY: 'center', selectable: false, evented: false });
      this.canvas.add(vehicle);
      this.canvas.sendToBack(vehicle);
    });
  }

  renderGallery() {
    const gallery = document.getElementById('sticker-gallery');
    gallery.innerHTML = '';
    this.stickers.forEach(sticker => {
      const div = document.createElement('div');
      div.className = 'sticker-item';
      div.innerHTML = `<img src='${sticker.image}' alt='${sticker.name}' draggable="true">`;

      div.querySelector('img').addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', sticker.image);
      });

      gallery.appendChild(div);
    });

    // Drag & drop onto canvas
    const canvasEl = document.getElementById('design-canvas');
    canvasEl.addEventListener('dragover', e => e.preventDefault());
    canvasEl.addEventListener('drop', e => {
      e.preventDefault();
      const url = e.dataTransfer.getData('text/plain');
      this.addSticker(url, e.offsetX, e.offsetY);
    });
  }

  addSticker(imageUrl, x = 450, y = 200) {
    fabric.Image.fromURL(imageUrl, img => {
      img.set({ left: x, top: y, originX: 'center', originY: 'center', scaleX: 0.5, scaleY: 0.5 });
      img.setControlsVisibility({ mtr:true }); // rotation
      this.canvas.add(img);
    });
  }

  setupVehicleButtons() {
    const buttons = document.querySelectorAll('.vehicle-option');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentVehicle = btn.dataset.vehicle;
        this.canvas.clear();
        this.loadVehicle();
      });
    });
  }

  setupControls() {
    document.getElementById('browse-user-image').addEventListener('click', () => {
      document.getElementById('user-file-input').click();
    });

    document.getElementById('user-file-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = f => this.addSticker(f.target.result);
      reader.readAsDataURL(file);
    });

    document.getElementById('add-text-btn').addEventListener('click', () => {
      const text = document.getElementById('text-input').value;
      const color = document.getElementById('text-color').value;
      const font = document.getElementById('font-select').value;
      const size = parseInt(document.getElementById('text-size').value);
      if (!text) return;
      const t = new fabric.Text(text, { left: 450, top: 200, fill: color, fontFamily: font, fontSize: size, originX: 'center', originY: 'center' });
      this.canvas.add(t);
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
      this.canvas.clear();
      this.loadVehicle();
    });

    document.getElementById('download-btn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = this.canvas.toDataURL({ format: 'png', quality: 1 });
      link.download = 'sticker-design.png';
      link.click();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new StickerDesigner());
