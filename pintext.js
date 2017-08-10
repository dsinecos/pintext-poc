var multer = require('multer');
var upload = multer();

var express = require('express');
var path = require('path');
var app = express();
var PORT = process.env.PORT || 2347;
var bodyparser = require('body-parser');

var bcrypt = require('bcrypt');
const saltRounds = 1;

var pgp = require('pg-promise')();
var connectionString = process.env.DATABASE_URL || "pg://postgres:postgres@localhost:5432/pintext";
var pintextClient = pgp(connectionString);

var publicPath = path.resolve(__dirname, "./public");


app.set("views", path.resolve(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(express.static(publicPath));
//app.use(multer().single('fileName'));
app.use(require('body-parser').urlencoded({ extended: true }));

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || "pg://postgres:postgres@localhost:5432/pintext";
var client = new pg.Client(connectionString);
client.connect();

//client.query("DROP TABLE IF EXISTS pintext CASCADE");
client.query("CREATE TABLE IF NOT EXISTS pintext(user_id SERIAL PRIMARY KEY, title varchar(256), source varchar(512), textsnippet varchar, hash varchar(1024))");

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/pintextHomepage.html");
});

app.get('/textURL/:hash', function (req, res) {
    var hash = req.params.hash;
    var title= req.params.title;

    var sqlQuery = `SELECT *
                    FROM pintext
                    WHERE hash=$1`;

    pintextClient.query(sqlQuery, hash).then(function (data) {
        
        if (data.length === 0) {
            res.send("There are no categories to display at this point");
        } else {
            res.render("displayTextSnippet.ejs", {title: data[0].title, source: data[0].source, textSnippet: data[0].textsnippet});
            console.log("Inside displaying text snippet code");
            console.log(data[0].title);
            //res.send("Processed");
            /*
            res.write("Following categories were retrieved for the user");
            res.write("\n");
            res.write(JSON.stringify(data, null, "  "));
            res.end();
            */
        }

    }).catch(function (error) {
        res.status(500).send("Internal server error ");
        console.log("Error retrieving from the database. The following is the error");
        console.log(error);
    });


});

app.post('/getURL', function (req, res) {

    var pintext = {
        title: req.body.title,
        source: req.body.source,
        textsnippet: req.body.textsnippet
    }

    var inputForHash = req.body.title + req.body.source + req.body.textsnippet;

    bcrypt.hash(inputForHash, saltRounds, function (err, hash) {

        if (hash.indexOf('/') === -1) {
            pintext.hash = hash;
        } else  {
            hash = hash.split('/').join('.');
            pintext.hash = hash;
        }

        var sqlQuery = `INSERT 
                        INTO pintext (title, source, textsnippet, hash)
                        VALUES ($1, $2, $3, $4)`;

        pintextClient.query(sqlQuery, [pintext.title, pintext.source, pintext.textsnippet, pintext.hash]).then(function (data) {
            //console.log("Successfully data chala gaya database mein, hoyee");
            console.log("Text snippet added successfuly");
        }).catch(function (err) {
            console.log("Error happened " + err);

        });

        console.log("The hash is : " + hash);
        res.write("/textURL/"+pintext.hash);
        res.end();
        /*
        res.write(JSON.stringify(pintext, null, "  "));
        res.write("This is the url /textURL/" + hash);
        res.end();
        */
    });

    console.log("Request received");
    console.log(req.body);
    console.log(inputForHash);

})

app.listen(PORT);