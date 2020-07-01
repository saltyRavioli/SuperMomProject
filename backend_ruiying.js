const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mysql = require("mysql");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pug = require('pug');
app.set('view engine', 'pug')


//connect to mysql 
/* database not built
const dbConnection = mysql.createConnection({ 
    host: 
    user:
    password: 
    database:
});

dbConnection.connect(function (err) {
    if (err) {
        console.log(err)
    }
    console.log("connected to database")
});
*/

// register for event
app.post('/event_dis', function (req, res) {
    // get event id
    var event_name = 'EventA'; /* where is event name? */
    dbConnection.query(`select event_id from event_info where event_title = ?`,[event_name], function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            var event = result.event_id;
            if (document.cookie == null) {
                res.sendFile(__dirname + "/login.html")
            } else {
                var user_id = req.SupermomSession.memberID;
                dbConnection.query(`insert into event_member values ?`, [[null, event, user_id]], function (err, result, field) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.sendFile(__dirname + "/registerSucess.html");
                    }
                })
            }
        }
    })
});


//Online shop page
app.post('/Search', function (req, res) {
    dbConnection.query(`select * from product where product_name = %'${req.body.keyword}'%`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    });
});

//list by category or Sale
app.post('/beauty', function (req, res) {
    dbConnection.query(`select *from product_order where catehory = 'make up' order by avg_ratings`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    });
});

app.post('/fashion', function (req, res) {
    dbConnection.query(`select product_id from product_order where catehory = 'skin care' order by avg_ratings`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    });
});

app.post('/familyproduct', function (req, res) {
    dbConnection.query(`select product_id from product_order where catehory = 'family product' order by avg_ratings`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    });
});

app.get('/babyproducts', function (req, res) {
    dbConnection.query(`select product_id from product_order where catehory = 'baby products' order by avg_ratings`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    });
});

app.get('/Sale', function (req, res) {
    dbConnection.query(`select product_id from product_order where product_status = 'Sale' order by avg_ratings`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    });
});

// chatroom