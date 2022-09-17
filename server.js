const mongoose = require('mongoose');
const dotenv = require('dotenv');

console.log('.................Application is starting.............');
// connecting config file
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_LOCAL;
//console.log(process.env.DATABASE);

// Connection to MongoDB with Mongoose ORM
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('db connection successful');
  });

// Run Server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}....`);
});
