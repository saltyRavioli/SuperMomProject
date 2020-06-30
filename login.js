var express = require("express");
var mysql = require('mysql');
var session = require('client-sessions'); 
 
//use the application off of express.
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // need this to do stuff like req.body.parameter 

app.use(session({
  cookieName: 'SuperMomSession', // cookie name dictates the key name added to the request object
  secret: 'random_string_goes_here', //encrypt later (should be a large unguessable string)
  duration: 30 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 5 * 60 * 1000, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
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
    //show this file when the "/" is requested
    response.sendFile(__dirname+"/login.html");
});
app.post("/login", function (request, response) { //apparently app.post() only activates if the page is called by another page?`
  //show this file when the "/" is requested
  response.sendFile(__dirname+"/login.html");
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
  console.log('Username:')
  console.log(req.SuperMomSession.user);
  console.log('Password:')
  console.log(req.SuperMomSession.pword);
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
*/
app.get('/createOrders', (req, res) => {
  sql = `create table orders(
    order_id bigint primary key auto_increment,
    product_id bigint not null,
    member_id bigint not null,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ratings int,
    feedback text(1000),
    order_status varchar(30)
    );`
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else {
      console.log(result);
    }
  });
});
app.get('/createOrders', (req, res) => {
  sql = `create table orders(
    order_id bigint primary key auto_increment,
    product_id bigint not null,
    member_id bigint not null,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ratings int,
    feedback text(1000),
    order_status varchar(30)
    );`
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else {
      console.log(result);
    }
  });
});
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
app.get('/createProducts', (req, res) => {
  sql = `create table products(
    product_id bigint primary key auto_increment,
    product_name varchar(50) not null,
    product_description text (1000),
    product_price numeric(4,2) not null,
    category varchar(50),
    product_status varchar (10),
    image_path varchar(500)
    );`
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else {
      console.log(result);
    }
  });
});
app.get('/addProducts', (req, res) => {
  sql = `insert into products values (null, 'Ripped Skinny Jeans', 'Skinny jeans with five pockets. Washed effect with rips at legs and hem. Front zip and metal button closure.', 24.99, 'Fashion', null,null),
  (null,'Mega Ripped Jeans','Medium blue ripped jeans with denim patches underneath, for staying covered up without sacrificing your style.',19.99,'Fashion','Sale',null),
  (null, 'Vintage Skinny Jeans','Jeans made from stretch fabric with holding power technology. High-waisted vintage style. Five pockets. Washed effect. Front zip and metal button closure.',14.99, 'Fashion',null,null),
  (null, 'Bamboo Baby Wipes', 'Wet Wipes. Made of eco-friendly, unbleached bamboo and enriched with natural and organic oils. Chlorine, Sulphates & Parabens Free. Contains 6 pack, per pack 80 wipes.',35.94,'Baby Products','Sale',null),
  (null,'All Purpose Cleaning Wipes','Dry Wipes. Multi-purpose: a powerful wipe for all surfaces at home and away: perfect for toys, high chairs, swings and even countertops.', 8.99,'Baby Products',null,null),
  (null,'Baby Toothbrush & Banana Toothbrush','100% food grade silicone,FDA stand BPA free. The soft and flexible material decreases risk of mouth injury.',9.99,'Baby Products','Sale',null),
  (null,'FLINTSTONES Gummies Multivitamin','Come in great tasting, chewy fruit flavours and fun character shapes. Contains Vitamin A, vitamin D, vitamin B6 and vitamin B12.',8.97,'Baby Products',null,null),
  (null,'Cartoon First Aid Bandages','Water resistible and breathable,but do not be soaked in water for a long time. Lovely cartoon design. Include 20 pieces per package.',23.14,'Family Products',null,null),
  (null,'No Contact Infrared Thermometer','Measurement work is completed in an instant in 1 second, instant reading,more accurate than standard mercury thermometers. Suitable for baby, children, adults and room/object.',27.70,'Family Products','Sale',null),
  (null,'Heating Bottle','High quality silicone material, size 240*50*105mm. Can be used as a home treatment for pain, pain and sports injuries or be used as a cold compression.',19.51,'Family Products',null,null),
  (null,'Deborah Lippmann','Gel Lab Pro Nail Polish',26.00,'Beauty',null,null);`
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
    else {
      console.log(result);
    }
  });
});

app.get('/orders', (req, res) => {
  // let sql = `SELECT * FROM products WHERE product_id = ANY 
  //       (SELECT * FROM orders WHERE member_id = ANY 
  //         (SELECT * FROM members WHERE user_name = '${req.SuperMomSession.user}'
  //       ));`
  //       //sql subqueries
  // let query = con.query(sql, function(err, rows, result) {
  //   if(err) {
  //       console.log("An error occurred.");
  //       throw err;
  //   }
  //   res.render('orders', {
  //       title: 'Order List',
  //       items: rows
  //   })
  //   console.log(rows);
  // });
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
      let sql2 = `SELECT * FROM products WHERE product_id IN (SELECT product_id FROM orders WHERE member_id = '${member_ID}');`; //yay subqueries

      let query2 = con.query(sql2, function(err, rows, fields) {
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
    }
  });
/*
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
      var member_ID = -1; 
      member_ID = result[0].memberID;
      let sql2 = `SELECT * FROM orders WHERE member_id = '${member_ID}'`; 
      let sql3 = `SELECT * FROM products WHERE product_id = ANY 
        (SELECT * FROM orders WHERE member_id = ANY 
          (SELECT * FROM members WHERE user_name = '${req.SuperMomSession.user}'
        ));`
      let query2 = con.query(sql2, function(err, rows, fields) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
            title: 'Order List',
            items: rows
        })
      });
    }
*/
});
app.get('/products', (req, res) => {
  let sql = `SELECT * FROM products`;

  let query = con.query(sql, function(err, rows, fields) {
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

app.get('/logout', function (req, res) {
  delete req.SuperMomSession.user;
  res.redirect('/login');
});   

//start the server
app.listen(8080);

console.log("Something awesome to happen at http://localhost:8080");
