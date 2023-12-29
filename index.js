//domain name = user-data-api.stackion.net
require("dotenv").config();
const http = require("http");
const {parse} = require("querystring");
const mysql = require("mysql");

const port = process.env.PORT || 4001;

let con = mysql.createConnection({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
});
function end_con() {
    con.end();
    con = mysql.createConnection({
        host : process.env.MYSQL_HOST,
        user : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DATABASE
    });
}

http.createServer((req , res) => {
    try {
        if(req.headers.origin === process.env.ALLOWED_ORIGIN ) {
            res.writeHead(200,{
                "Access-Control-Allow-Origin"       :  process.env.ALLOWED_ORIGIN,
                "Acess-Control-Allow-Methods"       : "OPTIONS, POST, GET",
                "Access-Control-Max-Age"            : 2592000,
                "Access-Control-Request-Headers"    : "Content-Type"
            });
            if(req.method === "POST") {
                let rBody = "" , qData , email_address , password , request_name;
        
                req.on("data", data => rBody += data );
        
                req.on("end" , () => {
                    qData = parse(rBody);
                    //query params
                    email_address = qData.email_address;
                    password = qData.password;
                    request_name = qData.request_name;
                    
                    if(email_address && password && request_name === "user-data") {
                       send_user_data(email_address,password);
                    }
                });
            }
            else {
                res.write("Hello world!");
                res.end();
            }
        }
        else {
            res.writeHead(403,{
                "Access-Control-Allow-Origin"       : process.env.ALLOWED_ORIGIN
            });
            res.write("sorry");
            res.end();
        }
    
        function send_user_data(email , password) {
            let sql = `SELECT * FROM users WHERE email_address = ? AND password = ? LIMIT 1`;
            con.query(sql , [email , password] , (err , result) => {
                if(err) throw err;
                if(result.length > 0) {
                    end_con();
                    //send response
                    res.write(JSON.stringify(result[0]));
                    res.end();
                }
                else {
                    res.write("incorrect-credentials");
                    res.end();
                }
            })
        }
    }
    catch(error) {
        console.error(error)
        return res.end("something went wrong")
    }
}).listen(port, () => console.log(`server is running on port : ${port}`));