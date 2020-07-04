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
  duration: 1000*60*60*24*3, // how long the session will stay valid in ms
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
app.use('/files', express.static(__dirname));

app.get("/test", function (req, res) {
  res.render('test')
});
app.get("/testHTML", function (req, res) {
  res.sendFile(__dirname+"/test.html");
});

app.get("/shop", function (request, response) { //apparently app.get() only activates if the user types in the password?
  let sql = `SELECT * FROM products ORDER BY category`;
  let query = con.query(sql, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      let sql2 = `SELECT * FROM category ORDER BY topic_name`;
      let query2 = con.query(sql2, function(err, rows2, fields) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        response.render('shop', { // 'posts' <-- whatever's in here should match the filename in the views folder
            title: 'Product Details',
            items: rows,
            categories: rows2
        })
    });
  });
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
  renderingIndexPage(false, false, request, response);
});
app.get("/index", function (request, response) {
  renderingIndexPage(false, false, request, response);
});

function renderingIndexPage(loginF, signUpF, req, res) {
  if (req.SuperMomSession.remember == true) {
    res.render('index', {
          username: req.SuperMomSession.user,
          password: req.SuperMomSession.pword,
          loginFailed: Boolean(loginF),
          signUpFailed: Boolean(signUpF)
    })
  }
  //show this file when the "/" is requested
  else {
    res.render('index', {
      username: '',
      password: '',
      loginFailed: Boolean(loginF),
      signupFailed: Boolean(signUpF)
    })
  }
}

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
app.post("/homepage", function (req, res) {
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
              req.SuperMomSession.user = req.body.uname;
              req.SuperMomSession.pword = req.body.pword;
              req.SuperMomSession.memberID = req.body.memberID;
              req.SuperMomSession.remember = false;
              renderingIndexPage(false, false, req, res);
            }
          });
      }
      else {
        console.log(result);
        console.log('name exists');
        req.SuperMomSession.user = '';
        req.SuperMomSession.pword = '';
        req.SuperMomSession.memberID = '';
        renderingIndexPage(false, true, req, res);
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
        if (result.length == 0 || result == undefined) {
          req.SuperMomSession.user = '';
          req.SuperMomSession.pword = '';
          req.SuperMomSession.memberID = '';
          renderingIndexPage(true, false, req, res);
        }
        else {
          if (req.body.pword === result[0].pword) { //remember this syntax: result[0].pword
            req.SuperMomSession.user = result[0].user_name;
            req.SuperMomSession.pword = result[0].pword;
            console.log(result);
            req.SuperMomSession.memberID = result[0].memberID;
            if (req.body.remember=='on') {
              console.log(req.body.remember);
              req.SuperMomSession.remember = true;
            }
            else {
              req.SuperMomSession.remember = false;
            }
            console.log(req.SuperMomSession.pword);
            renderingIndexPage(false, false, req, res);
          }
          else {
            req.SuperMomSession.user = '';
            req.SuperMomSession.pword = '';
            req.SuperMomSession.memberID = '';
            renderingIndexPage(true, false, req, res);
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
      res.render('profile', {
          user: rows
      })
  });
});

app.get("/modifyUser", function (req, res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var address = qdata.address;
  var children = qdata.children;
  var email = qdata.email;
  var password = qdata.pword;
  if (address != '' && address != null) {;
    let sql = `UPDATE members SET adress = '${address}' WHERE memberID = ${req.SuperMomSession.memberID};`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
      }
    });
  }
  if (children != null) {;
    let sql = `UPDATE members SET num = '${children}' WHERE memberID = ${req.SuperMomSession.memberID};`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
      }
    });
  }
  if (email != '' && email != null) {;
    let sql = `UPDATE members SET email = '${email}' WHERE memberID = ${req.SuperMomSession.memberID};`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
      }
    });
  }
  if (password != '' && password != null) {;
    let sql = `UPDATE members SET pword = '${password}' WHERE memberID = ${req.SuperMomSession.memberID};`;
    let query = con.query(sql, function(err, result) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      else {
      }
    });
  }
  let sql = `SELECT * FROM members WHERE user_name = '${req.SuperMomSession.user}'`;

  let query = con.query(sql, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      res.render('profile', {
          user: rows
      })
  });
});

app.get('/shoppingCart', (req, res) => {
  console.log("here");
  renderingShoppingCart(req, res);
});

function renderingShoppingCart(req, res) {
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
      console.log("test: "+result[0]);
      var member_ID = -1; 
      member_ID = result[0].memberID;
      let sql2 = `SELECT * FROM products 
      INNER JOIN shopping_cart
      ON (products.product_id = shopping_cart.product_id)
      WHERE member_id = '${member_ID}';`; //yay inner join
      

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
          let sql3 = `SELECT * FROM category`;
          let query3 = con.query(sql3, function(err, rows3, fields) {
            if(err) {
                console.log("An error occurred.");
                throw err;
            }
            res.render('shoppingCart', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows,
                categories: rows3,
                price: totalPrice,
                tax: (totalPrice*0.13).toFixed(2),
                total: (totalPrice*1.13).toFixed(2)
            })
          });
      });
    }
  });
}

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
          res.render('shop', { // 'posts' <-- whatever's in here should match the filename in the views folder
              title: 'Product Details',
              items: rows,
              categories: rows2
          })
      });
  });
});

app.get('/addToOrder*', (req, res) => {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var productID = qdata.productID;
  let sql = `INSERT INTO shopping_cart (member_id, product_id) values (${req.SuperMomSession.memberID}, ${productID})`;
  let query = con.query(sql, function(err, rows) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });

  let sql2 = `SELECT products.product_id, product_name, product_description, product_price FROM products 
  INNER JOIN shopping_cart
  ON (products.product_id = shopping_cart.product_id)
  WHERE member_id = '${req.SuperMomSession.memberID}';`;
  let query2 = con.query(sql2, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      let sql3 = `SELECT * FROM category`;
      let query3 = con.query(sql3, function(err, rows3, fields) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        renderingShoppingCart(req,res);
      });
  });
});

app.post('/addToOrder*', (req, res) => {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var productID = qdata.productID; 
  let sql = `INSERT INTO shopping_cart (member_id, product_id) values (${req.SuperMomSession.memberID}, ${productID})`;
  let query = con.query(sql, function(err, rows) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });

  let sql2 = `SELECT products.product_id, product_name, product_description, product_price FROM products 
  INNER JOIN shopping_cart
  ON (products.product_id = shopping_cart.product_id)
  WHERE member_id = '${req.SuperMomSession.memberID}';`;
  let query2 = con.query(sql2, function(err, rows, fields) {
      if(err) {
          console.log("An error occurred.");
          throw err;
      }
      let sql3 = `SELECT * FROM category`;
      let query3 = con.query(sql3, function(err, rows3, fields) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        renderingShoppingCart(req,res);
      });
  });
});

app.get('/searchProducts*', (req, res) => {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var keyword = qdata.keyword;
  console.log(keyword)
  con.query(`select * from products WHERE product_name LIKE '%${keyword}%'`, function (err, result, field) {
    if (err) {
        console.log(err)
    } else {
      let sql2 = `SELECT * FROM category ORDER BY topic_name`;
      let query2 = con.query(sql2, function(err, rows2, fields) {
        if(err) {
            console.log("An error occurred.");
            throw err;
        }
        res.render('shop', { // 'posts' <-- whatever's in here should match the filename in the views folder
            title: 'Product Details',
            items: result,
            categories: rows2
          })
        });
    }
  });
  // let sql = `SELECT * FROM products WHERE category = '${req.body.category}'`;
  // let query = con.query(sql, function(err, rows, fields) {
  //     if(err) {
  //         console.log("An error occurred.");
  //         throw err;
  //     }
  //     let sql2 = `SELECT * FROM category`;
  //     let query2 = con.query(sql2, function(err, rows2, fields) {
  //       if(err) {
  //           console.log("An error occurred.");
  //           throw err;
  //       }
  //       res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
  //           title: 'Product Details',
  //           items: rows,
  //           categories: rows2
  //       })
  //   });
  // });
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
  console.log(adr);
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
app.get("/deleteShoppingCart*", function (req, res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var id = qdata.id;
  var originURL = qdata.url; 
  sql = `DELETE FROM shopping_cart WHERE id = ${id};`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });
  // if (originURL=="shoppingCart") {
    renderingShoppingCart(req, res);
  // }
  // else
  //   renderingAdminPage(req, res);
});
app.get("/deleteUser*", function (req, res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var id = qdata.memberID; 
  sql = `DELETE FROM members WHERE memberID = ${id};`;
  let query = con.query(sql, function(err, result) {
    if(err) {
        console.log("An error occurred.");
        throw err;
    }
  });
  renderingAdminPage(req, res);
});

app.get('/displayEvent*', (req, res) => {
  res.sendFile(__dirname + "/event_dis.html");
  // var adr = req.url;
  // var q = url.parse(adr, true);
  // var qdata = q.query;
  // var name = qdata.name; 
  // let sql = `SELECT * FROM eventInfo WHERE event_title = '${name}'`;
  // let query = con.query(sql, function(err, rows, fields) {
  //     if(err) {
  //         console.log("An error occurred.");
  //         throw err;
  //     }
  //     var id = rows[0].event_id;
  //     let sql2 = `SELECT * FROM event_member WHERE event_member.event_id = '${id}'`;
  //     let query2 = con.query(sql, function(err, rows2, fields) {
  //         if(err) {
  //             console.log("An error occurred.");
  //             throw err;
  //         }
  //         res.render('eventDes', {
  //             event: rows,
  //             attendees: rows2
  //         })
  //     });
  //     res.render('eventDes', {
  //         event: rows

  //     })
  // });
});
app.get('/forum', function (req,res) {
  res.render("forum");
});

app.get('/forumPost', (req, res) => {
  con.query(`SELECT * FROM chats INNER JOIN members ON (chats.member_id = members.memberID)`, function (err, result, field) {
    if (err) {
        console.log(err)
    } else {
      res.render('forumPost', {
        comments: result,
      })
    }
  });
});

app.post('/searchPost', function (req,res) {
  if (req.body.time === 'old at first') { /* filter by time */
      if (req.body.authority === 'show all') {
          dbConnection.query(`select *from chatroom where room_title = %'${req.body.keyword}'% order by created_ts`, function (err, result, field) {
              if (err) throw err;
              res.render('chatrooms', {
                  title: 'Chatroom Details',
                  items: rows
              })
                  })
      } else {
          dbConnection.query(`select *from chatroom where room_title = %'${req.body.keyword}'% AND authority = private order by created_ts`, function (err, result, field) {
              if (err) {
                  console.log(err)
              } else {
                  res.render('chatrooms', {
                      title: 'Chatroom Details',
                      items: rows
                  })
              }
          })
      }
  } else {
      if (req.body.authority === 'show all') {
          dbConnection.query(`select *from chatroom where room_title = %'${req.body.keyword}'% order by created_ts DESC`, function (err, result, field) {
              if (err) throw err;
              res.render('chatrooms', {
                  title: 'Chatroom Details',
                  items: rows
              })
          })
      } else {
          dbConnection.query(`select *from chatroom where room_title = %'${req.body.keyword}'% AND authority = private order by created_ts DESC`, function (err, result, field) {
              if (err) {
                  console.log(err)
              } else {
                  res.render('chatrooms', {
                      title: 'Chatroom Details',
                      items: rows
                  })
              }
          })
      }
  }

});

// addcomment
app.get('/addComment*', function (req, res) {
  var adr = req.url;
  var q = url.parse(adr, true);
  var qdata = q.query;
  var content = qdata.content; //asking for the token field in the url
  con.query(`insert into chats (member_id, chat_content, room_id) values (${req.SuperMomSession.memberID},'${content}', 1)`, function (err, result, field) {
      if (err) {
          console.log(err)
      } else {
        con.query(`SELECT * FROM chats INNER JOIN members ON (chats.member_id = members.memberID)`, function (err, result, field) {
          if (err) {
              console.log(err)
          } else {
            res.render('forumPost', {
              comments: result,
            })
          }
        });
      }
  })
})

//register for event
app.post('/RegisterEvent', function (req, res) {
  // get event id
  dbConnection.query(`select event_id from event_info where event_title = EventA`, function (err, result, field) {
      if (err) {
          console.log(err)
      } else {
          var event = result[0].event_id;
          if (document.cookie === null) {
              res.sendFile(__dirname + "/login.html")
          } else {
              var user_id = req.SupermomSession.memberID;
              dbConnection.query(`insert into event_member values ?`, [[null, event, user_id]], function (err, result, field) {
                  if (err) {
                      console.log(err)
                  } else {
                      popup.alert({
                          content: 'You are sucessfully registered to the event!'
                      })
                  }
              })
          }
      }
  })
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
          sql3 = `SELECT * FROM products 
                  INNER JOIN shopping_cart
                  ON (products.product_id = shopping_cart.product_id)
                  INNER JOIN members
                  ON (shopping_cart.member_id = members.memberID)
                  ORDER BY shopping_cart.id`;
          let query3 = con.query(sql3, function(err, result3) {
            if(err) {
                console.log("An error occurred.");
                throw err;
            }
            else {
              sql4 = `SELECT * FROM members`;
              let query4 = con.query(sql4, function(err, result4) {
                if(err) {
                    console.log("An error occurred.");
                    throw err;
                }
                else {
                  let sql5 = `SELECT * FROM products ORDER BY category`;
                  let query5 = con.query(sql5, function(err, result5) {
                    if(err) {
                        console.log("An error occurred.");
                        throw err;
                    }
                    else {
                      response.render('adminPage', {
                        topics: result,
                        categories: result2,
                        shoppingCart: result3,
                        users: result4,
                        products: result5
                      })
                    }
                  });
                }
              });
            }
          });
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

app.post('/logout', function (req, res) {
  req.SuperMomSession.user = '';
  req.SuperMomSession.pword = '';
  req.SuperMomSession.memberID = '';
  renderingIndexPage(false, false, req, res);
});   

//start the server
app.listen(8080);

console.log("Running at http://localhost:8080");
