const express = require('express');
const mongoose = require('mongoose');
const VirtualPet = require('../models/VirtualPet');
const router = express.Router();

// 宠物列表页面 - GET /pets
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const pets = await VirtualPet.find({ owner: req.session.userId });
    
    res.render('pets/list', {
      title: '我的宠物',
      pets,
      dbStatus: '已连接',
      error: null
    });
  } catch (error) {
    console.error('获取宠物列表错误:', error);
    res.render('pets/list', {
      title: '我的宠物',
      pets: [],
      error: '获取宠物列表失败',
      dbStatus: '已连接'
    });
  }
});

// 显示创建宠物表单 - GET /pets/create
router.get('/create', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }

  res.render('pets/create', {
    title: '收养新宠物',
    dbStatus: '已连接',
    error: null
  });
});

// 处理创建宠物 - POST /pets/create
router.post('/create', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { name, species, rarity, traits, color } = req.body;
    
    // 处理 traits - 确保是数组
    let traitsArray = [];
    if (Array.isArray(traits)) {
      traitsArray = traits;
    } else if (traits) {
      traitsArray = [traits];
    }
    
    const newPet = new VirtualPet({
      name,
      species,
      rarity: rarity || '普通',
      traits: traitsArray,
      customizations: { color: color || '#667eea' },
      owner: req.session.userId
    });

    await newPet.save();
    console.log('✅ 宠物创建成功:', newPet.name);
    res.redirect('/pets');
  } catch (error) {
    console.error('❌ 创建宠物错误:', error);
    res.render('pets/create', {
      title: '收养新宠物',
      error: '创建宠物失败: ' + error.message,
      dbStatus: '已连接'
    });
  }
});

// 查看单个宠物详情 - GET /pets/:id
router.get('/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const pet = await VirtualPet.findOne({ 
      _id: req.params.id, 
      owner: req.session.userId 
    });

    if (!pet) {
      return res.status(404).render('error', {
        title: '宠物未找到',
        message: '没有找到这个宠物',
        dbStatus: '已连接'
      });
    }

    res.render('pets/detail', {
      title: `宠物详情 - ${pet.name}`,
      pet,
      dbStatus: '已连接',
      error: null
    });
  } catch (error) {
    console.error('获取宠物详情错误:', error);
    res.status(500).render('error', {
      title: '错误',
      message: '获取宠物详情失败',
      dbStatus: '已连接'
    });
  }
});

// 照顾宠物 - POST /pets/:id/care
router.post('/:id/care', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { action } = req.body;
    const pet = await VirtualPet.findOne({ 
      _id: req.params.id, 
      owner: req.session.userId 
    });

    if (!pet) {
      return res.status(404).json({ error: '宠物未找到' });
    }

    // 根据不同的照顾动作更新状态
    switch (action) {
      case 'feed':
        pet.stats.hunger = Math.min(100, pet.stats.hunger + 30);
        pet.stats.energy = Math.min(100, pet.stats.energy + 10);
        break;
      case 'play':
        pet.stats.happiness = Math.min(100, pet.stats.happiness + 30);
        pet.stats.energy = Math.max(0, pet.stats.energy - 20);
        break;
      case 'rest':
        pet.stats.energy = Math.min(100, pet.stats.energy + 40);
        pet.stats.hunger = Math.max(0, pet.stats.hunger - 10);
        break;
    }

    await pet.save();
    res.redirect(`/pets/${pet._id}`);
  } catch (error) {
    console.error('照顾宠物错误:', error);
    res.status(500).redirect('/pets');
  }
});

// 删除宠物 - POST /pets/:id/delete
router.post('/:id/delete', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    await VirtualPet.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.session.userId 
    });

    res.redirect('/pets');
  } catch (error) {
    console.error('删除宠物错误:', error);
    res.status(500).redirect('/pets');
  }
});

module.exports = router;
