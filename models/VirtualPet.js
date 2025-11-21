const mongoose = require('mongoose');

const virtualPetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 30
  },
  species: { 
    type: String, 
    required: true,
    enum: ['dragon', 'cat', 'dog', 'rat', 'elf', 'robot', 'wolf', 'deer', 'duck', 'bear']
  },
  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary'],
    default: 'Common'
  },
  traits: [{
    type: String,
    enum: ['Fire Breath', 'Glowing', 'Can Sing', 'Invisible', 'Flying', 'Water Breathing', 'Fast Moving', 'Giant', 'Tiny']
  }],
  stats: {
    hunger: { type: Number, default: 50, min: 0, max: 100 },
    happiness: { type: Number, default: 50, min: 0, max: 100 },
    energy: { type: Number, default: 50, min: 0, max: 100 }
  },
  birthDate: { type: Date, default: Date.now },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  createdBy: {
    type: String,
    enum: ['web', 'api'],
    default: 'web'
  }
}, {
  timestamps: true
});

// 虚拟方法：获取宠物图片路径
virtualPetSchema.virtual('imageUrl').get(function() {
  const speciesImages = {
    'dragon': '/images/dragon.png',
    'cat': '/images/cat.png',
    'dog': '/images/dog.png',
    'rat': '/images/rat.png',
    'elf': '/images/elf.png',
    'robot': '/images/robot.png',
    'wolf': '/images/wolf.png',
    'deer': '/images/deer.png',
    'duck': '/images/duck.png',
    'bear': '/images/bear.png'
  };
  return speciesImages[this.species] || '/images/default-pet.png';
});

// 虚拟方法：获取稀有度颜色
virtualPetSchema.virtual('rarityColor').get(function() {
  const rarityColors = {
    'Common': '#6c757d',    // 灰色
    'Rare': '#17a2b8',      // 蓝色
    'Epic': '#6f42c1',      // 紫色
    'Legendary': '#e83e8c'  // 粉色
  };
  return rarityColors[this.rarity] || '#6c757d';
});

// 虚拟方法：宠物描述
virtualPetSchema.virtual('description').get(function() {
  const descriptions = {
    'dragon': 'Majestic flying creature with ancient wisdom and powerful breath attacks.',
    'cat': 'Agile and independent companion with mysterious nocturnal habits.',
    'dog': 'Loyal and energetic friend who loves to play and protect its owner.',
    'rat': 'Clever and quick creature with excellent problem-solving skills.',
    'elf': 'Magical forest being with connection to nature and ancient magic.',
    'robot': 'Futuristic tech companion programmed for assistance and friendship.',
    'wolf': 'Wild and free spirit with strong pack instincts and keen senses.',
    'deer': 'Graceful forest dweller known for its speed and gentle nature.',
    'duck': 'Cheerful water lover with excellent swimming and flying abilities.',
    'bear': 'Strong and protective creature with surprising intelligence and warmth.'
  };
  return descriptions[this.species] || 'A mysterious creature waiting to be discovered.';
});

virtualPetSchema.methods.needsCare = function() {
  return this.stats.hunger < 30 || this.stats.happiness < 30 || this.stats.energy < 30;
};

// 启用虚拟字段
virtualPetSchema.set('toJSON', { virtuals: true });
virtualPetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VirtualPet', virtualPetSchema);
