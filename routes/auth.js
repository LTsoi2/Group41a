const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// Registration page
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'User Registration',
    error: null,
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Registration handling
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: 'User Registration',
        error: 'Passwords do not match',
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      });
    }
    
    const newUser = new User({ username, email, password });
    await newUser.save();
    
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    
    res.redirect('/dashboard');
  } catch (error) {
    let errorMessage = 'Registration failed';
    if (error.code === 11000) {
      errorMessage = 'Username or email already exists';
    }
    res.render('auth/register', {
      title: 'User Registration',
      error: errorMessage,
      dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'User Login',
    error: null,
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Login handling
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('auth/login', {
        title: 'User Login',
        error: 'User does not exist',
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      });
    }
    
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.render('auth/login', {
        title: 'User Login',
        error: 'Incorrect password',
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      });
    }
    
    req.session.userId = user._id;
    req.session.username = user.username;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.render('auth/login', {
      title: 'User Login',
      error: 'Login failed',
      dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

module.exports = router;
