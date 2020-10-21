const session = require('express-session');

var ObjectId = require('mongodb').ObjectId; 

const router = require('express').Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


const update = (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { _id: ObjectId(req.session.Id) };
        var newvalues = { $set: { level: req.session.level } };
        dbo.collection("user").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          next();
          db.close();
        });
    });
};

const homeCheck = (req, res, next) => {
    if(req.session.Id == undefined) {
        res.redirect('/login');
    } else {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            let level = req.session.level + '';
            dbo.collection("question").find({level: level}).toArray(function(err, result) {
              if (err) throw err;
              if(result[0] == undefined) {
                res.redirect('/user/push.html');
              } else {
                res.locals.level = result[0].level;
                res.locals.question = result[0].question;
                next();  
              }
              db.close();
            });
        });
    }
}

const loginCheck = (req, res, next) => {
    if(req.session.Id == undefined) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/', homeCheck, update, (req, res) => {
    res.render('index', { username: req.session.username, level: res.locals.level, 
    question: res.locals.question, 
    solution: '2' });
});

const test = (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        let level = req.session.level + '';
        dbo.collection("question").find({level: level}).toArray(function(err, result) {
          if (err) throw err;
          if(req.body.answer == result[0].answer) {
              next();
          } else {
            res.redirect('/');
          }
          db.close();
        });
    });
};

router.post('/check', test, (req, res) => {
    req.session.level++
    res.redirect('/');
});

router.post('/push', (req, res) => {
    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        var number;
        var dbo = db.db("mydb");
        await dbo.collection("question").find({}).toArray(function(err, result) {
            if (err) throw err;
            number = result.length + 1 + '';
            var myobj = { level: number, question: req.body.question, answer: req.body.answer };
            dbo.collection("question").insertOne(myobj, function(err, res) {
                if (err) throw err;
                db.close();
            });
            db.close();
        });
    });
    res.redirect('/user/push.html');
});

router.get('/login', loginCheck, (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("user").find({email: req.body.email}).toArray(function(err, result) {
          if (err) throw err;
          if(result[0] === undefined) {
            res.redirect('/login');
          } else {
            if(result[0].email == req.body.email && result[0].password == req.body.password) {
                req.session.Id = result[0]._id;
                req.session.username = result[0].username;
                req.session.level = result[0].level;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
          }
          db.close();
        });
    });
})

router.get('/registrieren', loginCheck, (req, res) => {
    res.render('registrieren');
})

const userCheck = (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("user").find({email: req.body.email}).toArray(function(err, result) {
          if (err) throw err;
          if(result[0] == undefined) {
            next();
          } else {
            res.redirect('/registrieren');
          }
          db.close();
        });
    });
}

router.post('/registrieren', userCheck, (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = { username: req.body.username, email: req.body.email, password: req.body.password, level: 1 };
        dbo.collection("user").insertOne(myobj, function(err, res) {
          if (err) throw err;
          db.close();
        });
    });
    res.redirect('/login');
})

router.post('/logout', update, (req, res) => {
    req.session.destroy(err => {
        if(err) {
            res.redirect('/');
        }
        res.clearCookie('sid');
        res.redirect('/login');
    })
});

module.exports = router;