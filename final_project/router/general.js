const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get all books - Task 1
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book by ISBN - Task 2
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});

// Get books by author - Task 3
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (const [isbn, book] of Object.entries(books)) {
    if (book.author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push(book);
    }
  }

  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found by this author" });
  }

  return res.status(200).json(matchingBooks);
});

// Get books by title - Task 4
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (const [isbn, book] of Object.entries(books)) {
    if (book.title.toLowerCase().includes(title.toLowerCase())) {
      matchingBooks.push(book);
    }
  }

  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  return res.status(200).json(matchingBooks);
});

// Get book reviews - Task 5
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

/****************** VERSIONS WITH ASYNC/AWAIT AND AXIOS ******************/

// Task 10: Get all books using Axios (Async/Await)
public_users.get('/axios/books', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching books from API",
      error: error.message
    });
  }
});

// Task 11: Get book by ISBN using Axios (Promises)
public_users.get('/axios/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(404).json({
        message: "Book not found in API",
        error: error.message
      });
    });
});

// Task 12: Get books by author using Axios (Async/Await)
public_users.get('/axios/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const allBooks = await axios.get(`http://localhost:5000/`);
    const filteredBooks = Object.values(allBooks.data).filter(
      book => book.author.toLowerCase() === author.toLowerCase()
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching books from API",
      error: error.message
    });
  }
});

// Task 13: Get books by title using Axios (Async/Await)
public_users.get('/axios/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/`);
    const filteredBooks = Object.values(response.data).filter(
      book => book.title.toLowerCase().includes(title.toLowerCase())
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching books from API",
      error: error.message
    });
  }
});

module.exports.general = public_users;
