var express = require('express');
var router = express.Router();
var _ = require ('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require ("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var host = 'mongodb://localhost:27017/populateDb';
mongoose.connect(host);

var phoneSchema = new Schema({
  phnNo:{
    type: String,
    default: null
  }
});

var studentSchema = new Schema({
  studentName: {
    type: String,
    required: true
  },
  rollNo: {
    type: Number,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    streetName: String,
    city: String,
    pincde: Number
  },
  phone: [phoneSchema],
  emailId: {
    type: String,
    lowercase: true
  }
});

var bookSchema = new Schema({
  bookName: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true    
  }
});

var transactionSchema = new Schema({
  book:{
    type: Schema.Types.ObjectId,
    ref: 'book'
  },
  student: {
     type: Schema.Types.ObjectId,
     ref: 'person'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returned: {
    type: Boolean,
    default: false
  }
});

var person = mongoose.model('person', studentSchema, 'students');
var book = mongoose.model('book', bookSchema, 'books');
var transaction = mongoose.model('transaction', transactionSchema, 'transactions');
 
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', function(){
  console.log('Connected to DB');

  router.post('/transaction/:bId', function(req,res){
    var bId = req.params.bId;
    var sId = req.body.sId;
    let dueDate = new Date();
    dueDate.setDate(dueDate.getDate()+ 15);
    transaction.find({
      $and: [
        { 'book': bId },
        { 'returned': false}
        ]
    }, function(err, docs){
      if(err) throw err;
      if(_.isEmpty(docs)){
         var issuedBook = new transaction({
           book: bId,
           student: sId,
           dueDate: dueDate
          })
          
          issuedBook.save(function(err){
            if(err) throw err;
            res.status(200).json({
              'status': 'success',
              'message': 'Transaction saved'
            });
          });
      } else {
        req.status(404).json({
          'status': 'success',
          'message': 'Book is not available'
        });
      }
    });   
  });

  router.get('/transaction/:tId', function(req,res){
    var tId = req.params.tId;
    transaction
    .findOne({'_id': tId})
    .populate('book student')
    .exec(function(err, docs){
      if(err) throw err;
      if(_.isEmpty(docs)){
        res.status(204).json({
          'status': 'success',
          'message': 'No transaction'
        });
      } else {
        res.status(200).json(docs)
      }
    });
  });

  router.get('/transaction', function(req,res){   
    transaction
    .find({})
    .populate('book student')
    .exec(function(err, docs){
      if(err) throw err;
      if(_.isEmpty(docs)){
        res.status(204).json({
          'status': 'success',
          'message': 'No transaction'
        });
      } else {
        res.status(200).json(docs)
      }
    });
  });

  router.post('/student', function(req, res){
    var people = new person({
      studentName: req.body,studentName,
      rollNo: req.body.rollNo,
      dob: req.body.dob,
      streetName: req.body.streetName,
      city: req.body.city,
      pincode: req.body.pincode,
      phone: req.body.phone,
      emailId: req.body.emailId
    })

    people.save(function(err){
      if(err) throw err;
      req.status(200).json({
        'status': 'success',
        'message': 'Student details saved'
      });
    });
  });

  router.get('/student', function(req, res){
    person.find({},function(err, docs){
      if(err) throw err;
      if(_.isEmpty(docs)){
        res.status(204).json({
          'status': 'success',
          'message': 'No content'
        });
      } else {
        res.status(200).json(docs);
      }
    });
  });

    router.post('/book', function(req, res){
      var library = new book({
        bookName: req.body.bookName,
        author: req.body.author,
        pages: req.body.pages        
      })

      library.save(function(err){
        if(err) throw err;
        res.status(200).json({
          'status': 'successs',
          'message': 'Book details saved'
        });
      });
    });

    router.get('/book', function(req, res){
      book.find({},function(err, docs){
        if(err) throw err;
        if(_.isEmpty(docs)){
          res.status(204).json({
            'status': 'success',
            'message': 'No content'
          });
        } else {
          res.status(200).json(docs);
        }
      });
    });

    router.put('/transaction/:bId', function(req, res){
      var bId = req.params.bId;
      transaction
      .update({ 'book': bId },{
        $set: {
          returned: true
        }
      }, function(err, docs){
        if(err) throw err;
        res.status(200).json({
          'status': 'success',
          'message': 'Transaction updated'
        });
      });
    });

})

module.exports = router;
