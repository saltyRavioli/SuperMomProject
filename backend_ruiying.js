const express = require("express");
const app = express();
const mysql = require("mysql");
const popup = require('popups');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const pug = require('pug');
app.set('view engine', 'pug')


//connect to mysql 

const dbConnection = mysql.createConnection({ 
    host: 3360,
    user: root,
    password: wry980322,
    database: superMom
});

dbConnection.connect(function (err) {
    if (err) {
        console.log(err)
    }
    console.log("connected to database")
});


// register for event
app.post('/event_dis', function (req, res) {
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


//Online shop page
app.post('/Search', function (req, res) {
    dbConnection.query(`select *from product where product_name = %'${req.body.keyword}'%`, function (err, result, field) {
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
    dbConnection.query(`select *from product_order where category = 'make up' order by avg_ratings`, function (err, result, field) {
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
    dbConnection.query(`select product_id from product_order where category = 'skin care' order by avg_ratings`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.render('orders', { // 'posts' <-- whatever's in here should match the filename in the views folder
                title: 'Product Details',
                items: rows
            })
        }
    })
});

app.post('/familyproduct', function (req, res) {
    dbConnection.query(`select product_id from product_order where category = 'family product' order by avg_ratings`, function (err, result, field) {
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
    dbConnection.query(`select product_id from product_order where category = 'baby products' order by avg_ratings`, function (err, result, field) {
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

// Search posts
app.post('/searchPost', function (req,res) {
    if (req.body.slct1 === 'old at first') { /* filter by time */
        if (req.body.slct2 === 'show all') {
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
        if (req.body.slct2 === 'show all') {
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
/* not finished
app.post('/addcomment', function (req,res) {
    adconnection.query(`insert into chats values (null,,${req.SupermomSession.memberID},)`)
})