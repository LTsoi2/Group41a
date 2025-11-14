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
    enum: ['龙', '凤凰', '机器人', '灵狐', '水晶鹿', '神秘生物', '火焰猫', '雷电狼', '水精灵']
  },
  rarity: {
    type: String,
    enum: ['普通', '稀有', '史诗', '传说'],
    default: '普通'
  },
  traits: [{
    type: String,
    enum: ['喷火', '发光', '会唱歌', '隐身', '飞行', '水下呼吸', '快速移动', '巨大化', '迷你化']
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
    required: false // 改为非必需，允许API创建无主的宠物
  },
  customizations: {
    color: { type: String, default: '#667eea' },
    accessories: [String]
  },
  isAdopted: { type: Boolean, default: true },
  createdBy: {
    type: String,
    enum: ['web', 'api'],
    default: 'web'
  }
}, {
  timestamps: true
});

// 虚拟方法：检查宠物是否需要照顾
virtualPetSchema.methods.needsCare = function() {
  return this.stats.hunger < 30 || this.stats.happiness < 30 || this.stats.energy < 30;
};

// 静态方法：获取所有公共宠物（没有owner的）
virtualPetSchema.statics.findPublicPets = function() {
  return this.find({ owner: null });
};

module.exports = mongoose.model('VirtualPet', virtualPetSchema);
