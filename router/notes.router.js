'use strict';

const express = require('express');
const notesRouter = express.Router();

// Simple In-Memory Database
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);


// 1st GET request
notesRouter.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  
  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});
  
// Return specific notes based on ID
notesRouter.get('/notes/:id', (req, res, next) => {
  const {id} = req.params;
  
  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    res.json(item);
  });
  console.log(id);
  // res.send(note);
});
  
notesRouter.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];
  
  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  
  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

// Post (insert) an item
notesRouter.post('/notes', (req, res, next) => {
  const {title, content} = req.body;

  const newItem = { title, content };

  if (!newItem.title) {
    const err = new Error('Missing title in request body');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.location(`http://${req.headers.host}/api/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});

notesRouter.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  console.log(id);

  notes.delete(id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.status(204).end();
    } else {
      next();
    }
  });
});

module.exports = notesRouter;