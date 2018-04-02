//Підключаємо бібліотеки
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');

const dotenv = require('dotenv').config({
  silent: process.env.NODE_ENV === 'production',
  path: __dirname + '/.env'
});
const knex = require('./db/knex.js');
const port = process.env.PORT || 8000;

//Клієнтська частина сайту знаходитиметься у папці public
app.use(express.static(__dirname + '/public'));
//Стандарти кодування
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  'extended': 'true'
}));


//Авторизація
app.post('/login-auth', function(req, res) {
  knex.select().from('users').where('login', req.body.login)
    .then(function(rows) {
      if (rows[0] != undefined) {
        if (rows[0].password == req.body.pass) {
          var obj = {
            welcome: 'welcome',
            key: rows[0].password,
            id: rows[0].id
          }
          res.status(200).send(obj);
        } else {
          res.status(200).send("wrong password");
        }
      } else {
        res.status(200).send("wrong login");
      }
    })
});
//авторизація за допомогою localstorage
app.get('/login-cookie:ckey-:cid', function(req, res) {
  knex.select().from('users').where('id', req.params.cid)
    .then(function(rows) {
      if (rows.length != 0) {
        if (rows[0].password == req.params.ckey) {
          var obj = {
            login: rows[0].login,
            key: rows[0].password
          }
          res.status(200).send(obj);
        }
      } else {
        res.status(200).send("");
      }
    })
})

//Отримати вчителів
app.get('/teachers', function(req, res) {
  knex.select().from('teachers')
    .then(function(teachers) {
      res.status(200).send(teachers)
    })
});
//Отримати thead і key для вчителів
app.get('/column-for-teachers', function(req, res) {
  knex.select().from('column_for_teachers')
    .then(function(column) {
      res.status(200).send(column)
    })
});
//Отримати класи
app.get('/classroom2', function(req, res) {
  knex.select().from('classroom')
    .then(function(k) {
      res.status(200).send(k)
    })
});
//Отримати класи з вчителями
app.get('/classroom', function(req, res) {
  knex.select('classroom.id as id', 'classroom.teachers_id as id_t', 'classroom.name as class', 'teachers.name as name', 'teachers.sname as sname').from('classroom').innerJoin('teachers', 'classroom.teachers_id', 'teachers.id')
    .then(function(classroom) {
      res.status(200).send(classroom)
    })
});
//Отримати учнів певного класу
app.get('/pupils:index', function(req, res) {
  knex.select().from('pupils').where('classroom_id', req.params.index)
    .then(function(pupils) {
      res.status(200).send(pupils);
    })
});
//видалення вчителя
app.post('/del-teacher', function(req, res) {
  knex('teachers').where('id', req.body.id).del()
    .then(function() {
      res.sendStatus(200);
    })
})
//редагування вчителя
app.post('/edit-teach', function(req, res) {
  knex('teachers').where('id', req.body.id).update(req.body)
    .then(function() {
      res.sendStatus(200);
    })
})
//Додавання вчителя
app.post('/add-teach', function(req, res) {
  knex('teachers').insert({
      name: req.body.name,
      sname: req.body.sname
    })
    .then(function() {
      res.sendStatus(200);
    })
})
//Додавання стовпця
app.post('/add-column', function(req, res) {
  knex.schema.alterTable('teachers', function(t) {
      t.string(req.body.name, 50);
    })
    .then(function() {
      console.log('created new column - ' + req.body.name);
      res.sendStatus(200);
    })
})
//додавання thead і key для вчителів
app.post('/add-column-for-teachers', function(req, res) {
  knex('column_for_teachers').insert({
      name: req.body.name,
      key: req.body.key
    })
    .then(function() {
      res.sendStatus(200);
    })
})

//видалення класу
app.post('/del-class', function(req, res) {
  knex('classroom').where('id', req.body.id).del()
    .then(function() {
      res.sendStatus(200);
    })
})
//редагування класу
app.post('/edit-class', function(req, res) {
  knex('classroom').where('id', req.body.id).update({
      name: req.body.name,
      teachers_id: req.body.teachers_id
    })
    .then(function() {
      res.sendStatus(200);
    })
})
//Додавання класу
app.post('/add-class', function(req, res) {
  knex('classroom').insert({
      name: req.body.name,
      teachers_id: req.body.teachers_id
    })
    .then(function() {
      res.sendStatus(200);
    })
})
//отримати всіх учнів з класами
app.get('/pupils', function(req, res) {
  knex.select('pupils.id as id', 'pupils.name as name', 'pupils.sname as sname', 'classroom.name as class').from('pupils').innerJoin('classroom', 'pupils.classroom_id', 'classroom.id')
    .then(function(classroom) {
      res.status(200).send(classroom);
    })
});
//видалити учня
app.post('/del-pupil', function(req, res) {
  knex('pupils').where('id', req.body.id).del()
    .then(function() {
      res.sendStatus(200);
    })
});
//знайти учня за ім'ям
app.post('/search-pupil', function(req, res) {
  knex('pupils').where('name', req.body.name)
    .then(function(pupils) {
      res.status(200).send(pupils);
    })
});
//редагувати учня
app.post('/edit-pupil', function(req, res) {
  knex('pupils').where('id', req.body.id).update({
      name: req.body.name,
      sname: req.body.sname,
      classroom_id: req.body.classroom_id
    })
    .then(function() {
      res.sendStatus(200);
    })
})
//додати учня
app.post('/add-pupil', function(req, res) {
  knex('pupils').insert({
      name: req.body.name,
      sname: req.body.sname,
      classroom_id: req.body.classroom_id
    })
    .then(function() {
      res.sendStatus(200);
    })
})
//Усі адреси контролюються клієнтським ангуляром
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

//Запуск серверу
app.listen(port, function(err) {
  if (err) throw err;
  console.log('Server start on port 8000!');
});