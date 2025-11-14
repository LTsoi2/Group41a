require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('cookie-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'fallback-secret-key'],
  maxAge: 24 * 60 * 60 * 1000 // 24小时
}));

// 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ 成功连接到 MongoDB Atlas!');
  console.log('📊 数据库:', mongoose.connection.name);
})
.catch(err => {
  console.log('❌ 数据库连接失败:', err.message);
});

// 用户数据中间件
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { 
    username: req.session.username 
  } : null;
  next();
});

// 引入路由
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');

// 引入API路由
const apiRoutes = require('./routes/api');

// 使用API路由，前缀为 /api
app.use('/api', apiRoutes);

// 使用路由
app.use('/auth', authRoutes);
app.use('/pets', petRoutes);

// 在路由定义后添加调试中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 主页路由
app.get('/', (req, res) => {
  res.render('index', {
    title: '数字宠物收容所',
    dbStatus: mongoose.connection.readyState === 1 ? '已连接' : '断开'
  });
});

// 仪表板路由
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  res.redirect('/pets');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🐾 服务器运行在: http://localhost:${PORT}`);
});
