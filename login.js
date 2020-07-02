var express = require("express");
var mysql = require('mysql');
var session = require('client-sessions'); 
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var url = require('url');

//use the application off of express.
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // need this to do stuff like req.body.parameter 

app.use(session({
  cookieName: 'SuperMomSession', // cookie name dictates the key name added to the request object
  secret: 'random_string_goes_here', //encrypt later (should be a large unguessable string)
  duration: 1000*60*60*3, // how long the session will stay valid in ms
  cookie: { //https://www.npmjs.com/package/client-sessions
    //path: '/api', // cookie will only be sent to requests under '/api'
    maxAge: 1000*60*60*24*3, // duration of the cookie in milliseconds, defaults to 60000
      //rn maxAge is 3 days
    //ephemeral: false, // when true, cookie expires when the browser closes
    //httpOnly: true, // when true, cookie is not accessible from javascript
    //secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
  }
}));
//for the pug library
const pug = require('pug');
app.set('view engine', 'pug')

var con = mysql.createConnection({
  host: '192.168.2.40', 
  port: 3306,
  user: "root",
  password: "test",
  database: "SuperMom"
});
con.connect(function(err) {
  if (err) {
    console.log("Error");
    throw err;
  }
  else console.log("Connected!");
}); 

//define the route for "/"
app.get("/login", function (request, response) { //apparently app.get() only activates if the user types in the password?
  if (request.SuperMomSession.remember == true) {
    response.render('login', {
          username: request.SuperMomSession.user,
          password: request.SuperMomSession.pword
    })
  }
    //show this file when the "/" is requested
  else {
    response.render('login', {
      username: '',
      password: ''
    })
  }
});
app.post("/login", function (request, response) {
  if (request.SuperMomSession.remember == true) {
    response.render('login', {
          username: request.SuperMomSession.uname,
          password: request.SuperMomSession.pword
    })
  }
  //show this file when the "/" is requested
  else {
    response.render('login', {
      username: '',
      password: ''
    })
  }
});

app.post("/index", function (request, response) {
  if (request.SuperMomSession.remember == true) {
    response.render('index', {
          username: request.SuperMomSession.uname,
          password: request.SuperMomSession.pword
    })
  }
  //show this file when the "/" is requested
  else {
    response.render('index', {
      username: '',
      password: ''
    })
  }
});
app.get("/index", function (request, response) {
  if (request.SuperMomSession.remember == true) {
    response.render('index', {
          username: request.SuperMomSession.uname,
          password: request.SuperMomSession.pword
    })
  }
  //show this file when the "/" is requested
  else {
    response.render('index', {
      username: '',
      password: ''
    })
  }
});

/*
    memberID BIGINT
    user_name VARCHAR(20)
    pword VARCHAR(20)
    email VARCHAR(100)
    first_name VARCHAR(30)
    last_name VARCHAR(30)
    adress VARCHAR(50) (address lol)
    num INT
    level_id INT
*/
app.get("/signup", function (req, res) {
  res.sendFile(__dirname+"/signup.html");
});
app.get("/homepage", function (req, res) {
  console.log(req.SuperMomSession);
  let sql = `SELECT * FROM members WHERE user_name = '${req.SuperMomSession.user}'`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else if (result.length == 0) {
      console.log("No entry found:" + result);
      res.sendFile(__dirname+"/loginFailed.html");
    }
    else if (req.SuperMomSession.pword === result[0].pword) { //remember this syntax: result[0].pword
      req.SuperMomSession.user = result[0].user_name;
      req.SuperMomSession.pword = result[0].pword;
      res.sendFile(__dirname+"/homepage.html");
    }
  }); 
});

app.post("/signupCheck", function (req, res) {
  let sql = `SELECT * FROM members WHERE user_name = '${req.body.uname}'`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      if (result.length == 0) {
          sql2 = `INSERT INTO members(user_name, pword, email, num, level_id) values ('${req.body.uname}', '${req.body.pword}', '${req.body.email}', ${req.body.children}, 1)`
          let query2 = con.query(sql2, function(err, result) {
            if(err) {
                console.log("An error occurred.");
                throw err;
            }
            else {
              console.log(result);
              res.sendFile(__dirname+"/login.html");
            }
          });
      }
      else {
        console.log(result);
        console.log('name exists');
        res.sendFile(__dirname+"/signup.html");
      }
    }); 
  }
);

app.post('/validLogin', (req, res) => {
    console.log(req.body.uname);
    let sql = `SELECT * FROM members WHERE user_name = '${req.body.uname}'`; //back text not apostrophe
    //also req.body.uname is used to get input from html
    let query = con.query(sql, function(err, result) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        if (result.length == 0) {
            console.log("No entry found:" + result);
            res.sendFile(__dirname+"/loginFailed.html");
        }
        else {
          if (req.body.pword === result[0].pword) { //remember this syntax: result[0].pword
            req.SuperMomSession.user = result[0].user_name;
            req.SuperMomSession.pword = result[0].pword;
            req.SuperMomSession.memberID = result[0].memberID;
            if (req.body.remember=='on') {
              console.log(req.body.remember);
              req.SuperMomSession.remember = true;
            }
            else {
              req.SuperMomSession.remember = false;
            }
            res.sendFile(__dirname+"/homepage.html");
          }
          else {
            res.sendFile(__dirname+"/loginFailed.html");
          }
          console.log(result);
          console.log('get');
          console.log(req.body.pword);
          console.log(result[0].pword);
        }
    });
});

app.get("/enterEmail", function (req, res) {
  res.sendFile(__dirname+"/enterEmail.html");
});

app.post("/forgotPassword", function (req, res) {
  console.log(req.body.email);
  let sql = `SELECT * FROM members WHERE email = '${req.body.email}'`;
  let query = con.query(sql, function(err, result) {
    console.log(result);
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else if (result.length == 0) {
      res.sendFile(__dirname+"/loginFailed.html");
    }
    else {
      req.SuperMomSession.user = result[0].user_name;
      req.SuperMomSession.pword = result[0].pword;
      req.SuperMomSession.memberID = result[0].memberID;
      console.log(req.SuperMomSession.memberID);
    }
  });

  var token = uuid.v1();
  console.log(token);

  var transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
          user: "d2c057524d03ff",
          pass: "44031373928ff5"
      }
  });
  
  var sql2 = `UPDATE members SET 
          resetPasswordKey = '${token}', 
          expires = ADDTIME(CURRENT_TIMESTAMP(), "2:00:00")
        WHERE memberID = ${req.SuperMomSession.memberID};`
  let query2 = con.query(sql2, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else {
      console.log(result);
    }
  });
  
  var mailOptions = {
      from: 'nathanymlu@gmail.com',
      to: 'nathanymlu@gmail.com',
      subject: 'Reset Password',
      text: 'Reset your password by following this link: '+"http://localhost:8080/resetPassword/?token="+token
  };
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log(error);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
  res.sendFile(__dirname+"/emailSent.html");
});

app.get('/resetPassword*', function (req,res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var token = qdata.token; //asking for the token field in the url
  console.log(token)
  let sql = `SELECT * FROM members WHERE resetPasswordKey = '${token}'`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else if (result.length == 0 || Date.parse(result[0].expires)<Date.now()) {
      res.sendFile(__dirname+"/loginFailed.html");
    }
    else {
      req.SuperMomSession.user = result[0].user_name;
      req.SuperMomSession.pword = result[0].pword;
      req.SuperMomSession.memberID = result[0].memberID;
      res.sendFile(__dirname+"/resetPassword.html");
    }
  });
});

app.get('/members', function (req,res) {
  let sql = 'SELECT * FROM members';
  let query = con.query(sql, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      // res.write('<h1>Hello, World!</h1>');
      // res.end();
      res.render('posts', { // 'posts' <-- whatever's in here should match the filename in the views folder
          title: 'User  Details',
          items: rows
      })
  });
});

app.post("/newPassword", function (req, res) {
  let sql = `UPDATE members SET 
  pword = '${req.body.pword}' 
  WHERE memberID = ${req.SuperMomSession.memberID};`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
        console.log(result);
        res.render('login', {
          username: '',
          password: ''
        })
      }
    }); 
  }
);

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}
app.get('/user', (req, res) => {
  let sql = `SELECT * FROM members WHERE user_name = '${req.SuperMomSession.user}'`;

  let query = con.query(sql, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      // res.write('<h1>Hello, World!</h1>');
      // res.end();
      res.render('posts', { // 'posts' <-- whatever's in here should match the filename in the views folder
          title: 'User  Details',
          items: rows
      })
  });
});
/*
create table orders(
    order_id bigint primary key auto_increment,
    product_id bigint not null,
    member_id bigint not null,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ratings int,
    feedback text(1000),
    order_status varchar(30),
    constraint fk_member3 foreign key (member_id) references members (member_id),
    constraint fk_product foreign key (product_id) references products (product_id)
);

/*
create table products(
  product_id bigint primary key auto_increment,
  product_name varchar(50) not null,
  product_description text (1000),
  product_price numeric,
  category_id int,
  stock_num int,
  constraint fk_category foreign key(category_id) references category(category_id)
);
*/
app.get('/orders', (req, res) => {
  let sql = `SELECT * FROM members WHERE user_name = '${req.SuperMomSession.user}'`; 
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else if (result.length == 0) {
        console.log("No entry found:" + result);
        res.sendFile(__dirname+"/Error.html");
    }
    else {
      console.log("test: "+result);
      var member_ID = -1; 
      member_ID = result[0].memberID;
      let sql2 = ` SELECT products.product_id, product_name, product_description, product_price FROM products 
      INNER JOIN orders
      ON (products.product_id = orders.product_id)
      WHERE member_id = '${member_ID}';
      `; //yay inner join
      

      let query2 = con.query(sql2, function(err, rows, fields) {
          if(err) {
              console.log("An error occurred.");
              throw err;
          }
          var totalPrice = 0;
          rows.forEach((item, index) => { //for each loop
            totalPrice+=item.product_price;
          });
          totalPrice = totalPrice.toFixed(2); //rounding
          res.render('orders', {
              title: 'Product Details',
              items: rows,
              price: totalPrice 
          })
      });
    }
  });
});
app.get('/products', (req, res) => {
  let sql = `SELECT * FROM products`;

  let query = con.query(sql, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      let sql2 = `SELECT * FROM category`;
      let query2 = con.query(sql2, function(err, rows2, fields) {
          if(err) {
              console.log("An error occurred.");
              throw err;
          }
          console.log(rows2);
          // res.write('<h1>Hello, World!</h1>');
          // res.end();
          res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
              title: 'Product Details',
              items: rows,
              categories: rows2
          })
      });
  });
});

app.post('/addToOrder', (req, res) => {
  let sql2 = `INSERT INTO orders(member_id, product_id) values (${req.SuperMomSession.memberID}, ${req.body.productID})`;
  let query2 = con.query(sql2, function(err, rows) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });

  let sql3 = `SELECT * FROM products`;
  let query3 = con.query(sql3, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      // res.write('<h1>Hello, World!</h1>');
      // res.end();
      res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
          title: 'Product Details',
          items: rows
      })
  });
});

app.post('/searchProducts', (req, res) => {
  console.log(req.body.category);
  let sql = `SELECT * FROM products WHERE category = '${req.body.category}'`;
  let query = con.query(sql, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      let sql2 = `SELECT * FROM category`;
      let query2 = con.query(sql2, function(err, rows2, fields) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
            title: 'Product Details',
            items: rows,
            categories: rows2
        })
    });
  });
});

app.post("/adminPageCheck", function (req, res) {
  if (req.body.topic != '') {
    console.log(req.body.topic);
    sql = `INSERT INTO topic (topic_name, topic_desc) values ('${req.body.topic}', '${req.body.topicDes}')`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
      }
    });
  }
  if (req.body.category != '') {
    console.log(req.body.category);
    sql = `INSERT INTO category (topic_name, topic_desc) values ('${req.body.category}', '${req.body.categoryDes}')`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
        
      }
    });
  }
  renderingAdminPage(req, res);
});

app.get("/deleteTopic*", function (req, res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var id = qdata.topicID; 
  sql = `DELETE FROM topic WHERE topic_id = ${id};`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });
  renderingAdminPage(req, res);
});

app.get("/deleteCategory*", function (req, res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var id = qdata.topicID; 
  sql = `DELETE FROM category WHERE topic_id = ${id};`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });
  renderingAdminPage(req, res);
});

function renderingAdminPage(request, response) {
  sql = `SELECT * FROM topic`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else {
      sql2 = `SELECT * FROM category`;
      let query2 = con.query(sql2, function(err, result2) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        else {
          response.render('adminPage', {
            topics: result,
            categories: result2
          })
        }
      });
    }
  });
}

app.get("/adminPage", function (request, response) {
  renderingAdminPage(request, response);
});
app.post("/adminPage", function (request, response) {
  renderingAdminPage(request, response);
});

app.get('/logout', function (req, res) {
  delete req.SuperMomSession.user;
  res.redirect('/login');
});   

//start the server
app.listen(8080);

console.log("Something awesome to happen at http://localhost:8080");
