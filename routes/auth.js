const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// 注册页面
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: '用户注册',
    error: null,
    dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
  });
});

// 注册处理
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: '用户注册',
        error: '密码不匹配',
        dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
      });
    }
    
    const newUser = new User({ username, email, password });
    await newUser.save();
    
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    
    res.redirect('/dashboard');
  } catch (error) {
    let errorMessage = '注册失败';
    if (error.code === 11000) {
      errorMessage = '用户名或邮箱已存在';
    }
    res.render('auth/register', {
      title: '用户注册',
      error: errorMessage,
      dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
    });
  }
});

// 登录页面
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: '用户登录',
    error: null,
    dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
  });
});

// 登录处理
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('auth/login', {
        title: '用户登录',
        error: '用户不存在',
        dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
      });
    }
    
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.render('auth/login', {
        title: '用户登录',
        error: '密码错误',
        dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
      });
    }
    
    req.session.userId = user._id;
    req.session.username = user.username;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.render('auth/login', {
      title: '用户登录',
      error: '登录失败',
      dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
    });
  }
});

// 退出登录
router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

module.exports = router;
