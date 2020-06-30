const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mysql = require("mysql");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


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
app.get('/api/RegisterEvent', function (req, res) {
    // get event id
    var event_name = 'EventA'; /* where is event name? */
    dbConnection.query(`select event_id from event_info where event_title = ?`,event_name, function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            var event = result.event_id;
            var user_id = req.body.member_id;
            // insert into event_member
            dbConnection.query(`insert into event_member values ?`,[[null,event,user_id]], function (err, result, field) {
                if (err) {
                    console.log(err)
                }
                res.send(JSON.stringify(result));
            });
        }
    });
});

export class RegisterEventAPP implements OnInit {
    register() {
        if (document.cookie != null) {
            this.overallInfo = {};
            this.overallInfo['member_id'] = document.cookie
        }
    }
};

/* not finished
// search by key words
app.get('/api/Search', function (req, res) {
    var keyword = req.body.keyword;
    dbConnection.query(`select product_id from product_order where product_name = %?% order by avg_ratings`,[keyword], function (err, result, field) {
        if (err) {
            console.log(err)
        } else {
            var product_id = result.product_id
            res.send(JSON.stringify(result))
        }
    });
});

//list by category or Sale
app.get('/api/makeup', function (req, res) {
    dbConnection.query(`select *from product_order where catehory = 'make up' order by avg_ratings`, function (err, result, field) {
        if (err) { console.log(err) }
        else { res.send(JSON.stringify(result)) }
    });
});

app.get('/api/skincare', function (req, res) {
    dbConnection.query(`select product_id from product_order where catehory = 'skin care' order by avg_ratings`, function (err, result, field) {
        if (err) { console.log(err) }
        else { res.send(JSON.stringify(result)) }
    });
});

app.get('/api/familyproduct', function (req, res) {
    dbConnection.query(`select product_id from product_order where catehory = 'family product' order by avg_ratings`, function (err, result, field) {
        if (err) { console.log(err) }
        else { res.send(JSON.stringify(result)) }
    });
});

app.get('/api/babyproducts', function (req, res) {
    dbConnection.query(`select product_id from product_order where catehory = 'baby products' order by avg_ratings`, function (err, result, field) {
        if (err) { console.log(err) }
        else { res.send(JSON.stringify(result)) }
    });
});

app.get('/api/Sale', function (req, res) {
    dbConnection.query(`select product_id from product_order where product_status = 'Sale' order by avg_ratings`, function (err, result, field) {
        if (err) { console.log(err) }
        else { res.send(JSON.stringify(result)) }
    });
});