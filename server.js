const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 5000;
// const dbHost = process.env.DB_HOST;
// const dbUser = process.env.DB_USER;
// // const dbPass = process.env.DB_PASS;
// const dbName = process.env.DB_NAME;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fake_review'
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/api/products', upload.single('productImage'), (req, res) => {
  const productName = req.body.productName;
  const productImage = req.file.filename;

  const query = 'INSERT INTO products (name, image) VALUES (?, ?)';
  db.execute(query, [productName, productImage], (err, results) => {
    if (err) {
      console.error('Database insertion failed:', err);
      res.status(500).json({ error: 'Database insertion failed' });
      return;
    }
    res.status(200).json({ message: 'Product added successfully', data: results });
  });
});

app.get('/api/products', (req, res) => {
    const sql = 'SELECT p.*, GROUP_CONCAT(r.rating) AS rating FROM products as p LEFT JOIN ratings as r ON r.product_id = p.id GROUP BY p.id;';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Server error:', err);
        return res.status(500).send({ error: 'Server error' });
      }
      if (results.length > 0) {
        res.status(200).send(results);
      } else {
        res.status(404).send({ message: 'No products found' });
      }
    });
}); 

app.post('/api/rating', (req, res) => {
  const { id, review, rating, ip } = req.body;
  const sql = 'INSERT INTO ratings (product_id, rating, details, user_IP_adress) VALUES (?, ?, ?, ?)';
  db.query(sql, [id, rating, review, ip], (err, result) => {
    if (err) {
      console.error("Error inserting rating:", err);
      return res.status(500).send('Server error while inserting');
    }
    if (result.affectedRows > 0) {
      return res.status(200).send('Added successfully');
    } else {
      return res.status(500).send('Failed to add rating');
    }
  });
});

app.get('/api/reviws/:id', (req, res) => {
  const {id} = req.params;
  // console.log('hii'); return
  const sql = 'select * from ratings where product_id = ?'
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send('server err');
    if (results.length > 0) {
      return res.status(200).send(results);
    } else {
      return res.status(404).send('not found')
    }
  })
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const deleteProductSql = 'DELETE FROM products WHERE id = ?';
  const deleteRatingsSql = 'DELETE FROM ratings WHERE product_id = ?';

  db.query(deleteProductSql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).send('Server error while deleting product');
    }

    if (result.affectedRows > 0) {
      db.query(deleteRatingsSql, [id], (err, results) => {
        if (err) {
          console.error("Error deleting ratings:", err);
          return res.status(500).send('Product deleted, but server error while deleting ratings');
        }

        return res.status(200).send('Product and associated ratings deleted successfully');
      });
    } else {
      return res.status(404).send('Product not found');
    }
  });
});

app.get('/api/fake/reviews', (req, res) => {
  const sql = 'SELECT COUNT(id) AS total, GROUP_CONCAT(id) as ids, product_id, user_IP_adress, GROUP_CONCAT(rating) AS ratings, GROUP_CONCAT(details, "$divide$") AS details FROM ratings GROUP BY product_id, user_IP_adress HAVING COUNT(id) > 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('server err')
    if (results.length > 0) {
      return res.status(200).send(results)
    } else {
      return res.status(404).send('not found')
    }
  })
})

app.delete('/api/fake/reviews/:idsToDelete', (req, res) => {
  const { idsToDelete } = req.params;
  if (!idsToDelete || idsToDelete.length === 0) {
      return res.status(400).json({ message: 'Invalid IDs provided' });
  }

  const sql = `DELETE FROM ratings WHERE id = ?`;
  db.query(sql, [idsToDelete], (err, result) => {
      if (err) {
          console.log('Error deleting resources:', err);
          return res.status(500).json({ message: 'Failed to delete resources' });
      }
      console.log(`Deleted ${result.affectedRows} resource(s)`);
      res.json({ message: 'Resources deleted successfully' });
  });
});

app.listen(port, () => {
  console.log('Server is running on port 5000');
});
