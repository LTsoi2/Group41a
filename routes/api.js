const express = require('express');
const VirtualPet = require('../models/VirtualPet');
const router = express.Router();

// GET /api/pets - 获取所有宠物（支持查询）
router.get('/pets', async (req, res) => {
  try {
    const { species, rarity, trait, minHappiness, maxHappiness } = req.query;
    let filter = {};

    // 构建查询条件
    if (species) filter.species = species;
    if (rarity) filter.rarity = rarity;
    if (trait) filter.traits = { $in: [trait] };
    if (minHappiness !== undefined || maxHappiness !== undefined) {
      filter['stats.happiness'] = {};
      if (minHappiness !== undefined) filter['stats.happiness'].$gte = parseInt(minHappiness);
      if (maxHappiness !== undefined) filter['stats.happiness'].$lte = parseInt(maxHappiness);
    }

    const pets = await VirtualPet.find(filter);
    res.json({
      success: true,
      count: pets.length,
      data: pets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取宠物列表失败',
      error: error.message
    });
  }
});

// GET /api/pets/:id - 获取单个宠物
router.get('/pets/:id', async (req, res) => {
  try {
    const pet = await VirtualPet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '未找到该宠物'
      });
    }
    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取宠物详情失败',
      error: error.message
    });
  }
});

// GET /api/pets/public - 获取所有公共宠物（没有owner的）
router.get('/pets/public', async (req, res) => {
  try {
    const pets = await VirtualPet.find({ owner: null });
    res.json({
      success: true,
      count: pets.length,
      data: pets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公共宠物失败',
      error: error.message
    });
  }
});

// POST /api/pets/by-username - 通过用户名创建宠物（最简单的方法）
router.post('/pets/by-username', async (req, res) => {
  try {
    const { name, species, rarity, traits, stats, color, username } = req.body;

    // 验证必需字段
    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: '名称和物种是必需字段'
      });
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '用户名是必需字段'
      });
    }

    // 查找用户
    const User = require('../models/User');
    let user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `用户 '${username}' 不存在，请先通过网页注册`
      });
    }

    const newPet = new VirtualPet({
      name,
      species,
      rarity: rarity || '普通',
      traits: Array.isArray(traits) ? traits : [traits].filter(Boolean),
      stats: {
        hunger: stats?.hunger || 50,
        happiness: stats?.happiness || 50,
        energy: stats?.energy || 50
      },
      customizations: {
        color: color || '#667eea'
      },
      owner: user._id,
      createdBy: 'api'
    });

    await newPet.save();
    
    console.log(`✅ API创建宠物成功: ${newPet.name} (所有者: ${user.username})`);
    res.status(201).json({
      success: true,
      message: `宠物创建成功，所有者: ${user.username}`,
      data: newPet,
      owner: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('❌ API创建宠物错误:', error);
    res.status(400).json({
      success: false,
      message: '创建宠物失败',
      error: error.message
    });
  }
});
// PUT /api/pets/:id - 更新宠物
router.put('/pets/:id', async (req, res) => {
  try {
    const { name, species, rarity, traits, stats, color } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (species) updateData.species = species;
    if (rarity) updateData.rarity = rarity;
    if (traits) updateData.traits = traits;
    if (stats) {
      updateData.stats = {};
      if (stats.hunger !== undefined) updateData.stats.hunger = stats.hunger;
      if (stats.happiness !== undefined) updateData.stats.happiness = stats.happiness;
      if (stats.energy !== undefined) updateData.stats.energy = stats.energy;
    }
    if (color) updateData.customizations = { color };

    const pet = await VirtualPet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '未找到该宠物'
      });
    }

    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新宠物失败',
      error: error.message
    });
  }
});

// DELETE /api/pets/:id - 删除宠物
router.delete('/pets/:id', async (req, res) => {
  try {
    const pet = await VirtualPet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '未找到该宠物'
      });
    }
    res.json({
      success: true,
      message: '宠物已删除'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除宠物失败',
      error: error.message
    });
  }
});

module.exports = router;
