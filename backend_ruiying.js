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


//search products
app.post('/searchProduct', function (req, res) {
    dbConnection.query(`select *from products where product_name = %'${req.body.keyword}'%`, function (err, result, field) {
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
app.get('/beauty', function (req, res) {
    dbConnection.query(`select *from products where category = 'make up'`, function (err, result, field) {
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

app.get('/fashion', function (req, res) {
    dbConnection.query(`select *from products where category = 'skin care'`, function (err, result, field) {
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

app.get('/familyproduct', function (req, res) {
    dbConnection.query(`select *from products where category = 'family product'`, function (err, result, field) {
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
    dbConnection.query(`select *from products where category = 'baby products'`, function (err, result, field) {
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
    dbConnection.query(`select *from products where product_status = 'Sale'`, function (err, result, field) {
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
app.post('/addComment', function (req, res) {
    adconnection.query(`insert into chats values (null,1,${req.SupermomSession.memberID},'${req.body.comments}',default,default)`, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            res.sendFile(__dirname + "/formu_each.html")
        }
    })
})