// check-env.js

const fs = require('fs');
const path = require('path');

// Path to the .env file
const envFilePath = path.join(__dirname, '.env');

// Check if the .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('.env FILE IS MISSING!');

  const str = 'DB_USER=username\nDB_PWD=password\nDB_NAME=database\nDB_URL=server';

  fs.writeFile('.env', str, (err) => {
    console.log(`.env FILE CREATED`);
    console.log(`REPLACE WITH THE CORRECT DATABASE CREDENTIALS`);

    process.exit(1);
  });
}
