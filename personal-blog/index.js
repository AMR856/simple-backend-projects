const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const blogRouter = require('./routes/blog.route');
const { ERROR } = require('./utils/HTTPStatus');
const fs = require('fs');
const cors = require('cors');


dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const logFile = process.env.LOG_FILE_PATH;
const databaseConnectionString = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.USER_PASSWORD}@cluster0.f4fyfea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const LogStream = fs.createWriteStream(logFile, {
  flags: 'a',
});

app.use(morgan('tiny', { stream: LogStream }));
app.use(express.json());
app.use(cors());

mongoose
  .connect(databaseConnectionString)
  .then(() => {
    console.log('Connection to the database is successful');
  })
  .catch((err) => {
    console.log('Database connection error:', err);
  });

app.use(`/blogs`, blogRouter);

// app.all('*', (req, res) => {
//   res.status(404).json({
//     status: ERROR,
//     message: 'this resource is not available',
//   });
// });

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    LogStream.end(() => {
      fs.truncate(logFile, 0, (err) => {
        if (err) {
          console.error('Failed to clear the log file:', err);
        } else {
          console.log('Log file cleared');
        }
        process.exit(0);
      });
    });
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
