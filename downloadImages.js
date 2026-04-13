const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Créer le dossier public/perfumes s'il n'existe pas
const publicDir = path.join(__dirname, 'public', 'perfumes');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Liste des images avec noms de fichiers
const images = [
  // Homme
  { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', name: 'sauvage-elixir.jpg' },
  { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', name: 'bleu-chanel.jpg' },
  { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', name: 'aventus.jpg' },
  { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', name: 'terre-hermes.jpg' },
  { url: 'https://images.unsplash.com/photo-1610458845959-cudbde6c667e?w=400', name: 'acqua-gio.jpg' },
  { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', name: 'invictus.jpg' },
  { url: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', name: 'layton.jpg' },
  { url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400', name: 'spicebomb.jpg' },
  { url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400', name: 'dylan-blue.jpg' },
  { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', name: 'one-million.jpg' },

  // Femme
  { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59246?w=400', name: 'jadore.jpg' },
  { url: 'https://images.unsplash.com/photo-1595425970154-c9703cf48b6d?w=400', name: 'chanel-5.jpg' },
  { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', name: 'black-opium.jpg' },
  { url: 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?w=400', name: 'la-vie-belle.jpg' },
  { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', name: 'libre.jpg' },
  { url: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', name: 'good-girl.jpg' },
  { url: 'https://images.unsplash.com/photo-1610458845959-cudbde6c667e?w=400', name: 'delina.jpg' },
  { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', name: 'mon-guerlain.jpg' },
  { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', name: 'si.jpg' },
  { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', name: 'olympea.jpg' },

  // Unisexe
  { url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400', name: 'baccarat-rouge.jpg' },
  { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', name: 'oud-wood.jpg' },
  { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', name: 'gypsy-water.jpg' },
  { url: 'https://images.unsplash.com/photo-1610458845959-cudbde6c667e?w=400', name: 'another-13.jpg' },
  { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59246?w=400', name: 'english-pear.jpg' },
  { url: 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?w=400', name: 'reflection-man.jpg' },
  { url: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', name: 'neroli-portofino.jpg' },
  { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', name: 'santal-33.jpg' },
  { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', name: 'lv-imagination.jpg' },
  { url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400', name: 'oud-greatness.jpg' },
];

// Fonction de téléchargement
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(publicDir, filename);
    const file = fs.createWriteStream(filepath);
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Téléchargé: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Télécharger toutes les images
async function downloadAll() {
  console.log('🎨 Téléchargement des images de parfums...\n');
  
  for (const img of images) {
    try {
      await downloadImage(img.url, img.name);
    } catch (error) {
      console.error(`❌ Erreur: ${img.name} - ${error.message}`);
    }
  }
  
  console.log('\n✅ Téléchargement terminé!');
  console.log(`📁 Images sauvegardées dans: ${publicDir}`);
}

downloadAll();