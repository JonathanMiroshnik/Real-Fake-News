const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect using existing database config
const connectDatabase = require('../src/config/database');
const Article = require('../src/models/article'); // Needs to be created

(async () => {
  try {
    await connectDatabase();
    
    const data = fs.readFileSync(path.join(__dirname, 'entries.txt'), 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .map(JSON.parse);

    await Article.insertMany(data);
    console.log(`Inserted ${data.length} records`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();