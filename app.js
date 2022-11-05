const express = require("express")
const path=require("path")
const nodemailer = require('nodemailer');
const bodyParser=require("body-parser") 
const mailer = require("./email")
const database = require("./database") 
const mysql=require("mysql")
const connect_db=database.conn
const app = express()
//create mysql connection
const conn=mysql.createConnection({
  host:"host name", 
  user:"your username", 
  password:"your password",
  database:"database name"
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var name,email_id,passwd;
var verified=0

//to signup page
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"/public/index.html"))
})

//to login page
app.get("/signin",(req,res)=>{
  res.sendFile(path.join(__dirname,"/public/login.html"))
})

//to content page
app.get("/main",(req,res)=>{
  res.sendFile(path.join(__dirname,"/public/main.html"))
})

//to store signup details 
app.post("/",(req,res)=>{
  [name,email_id,passwd]=[req.body.uname,req.body.email,req.body.pass]
  var token=""
  var numbers="0123456789abcdefghijklmnopqrstuvwxyz";
  for(let i=0;i<12;i++){
    token+=numbers[Math.floor(Math.random()*30)];
  }
  conn.connect()
  console.log("connected");
  let chk_mail=`select count(email_id) as ecount from Users where email_id='${email_id}'`
  conn.query(chk_mail,(err,isemail)=>{
    if(err){
      res.send("something went wrong")
    }
    else if(isemail[0].ecount==1){
    console.log("Email already exist")
      res.send("Email already exist")
    }
    else{
        mailer.sendMail(name,email_id,token);
    let sql=`insert into Users (name,email_id,password,token,verified) values ('${name}','${email_id}','${passwd}','${token}','${verified}')`;
    conn.query(sql,(err)=>{
      if(err){
        res.send("Something went wrong");
      }
      else{
        console.log("Data stored");
        res.send("ok");
      }
    })
    }
  })
})

//to verify login token
app.get("/verify/:id/:token",(req,res)=>{
  const token=req.params.token;
  const id=req.params.id;
  
  let count_sql=`SELECT COUNT(id) as count_no FROM Users WHERE email_id='${id}' AND token='${token}'`;
  console.log(count_sql);
  if(!conn._connectCalled ) 
{
conn.connect();
}
    conn.query(count_sql,(err,rows)=>{
      if(err) throw err;
      else if(rows[0].count_no==1){
      conn.query(`update Users set verified=1 where email_id='${id}' and token='${token}'`)
        console.log("verified");
        res.send("verified")
      }
      else{
        res.send("error");
        console.log("Not_found");
      }
  })
}) 

//to verify login details
app.post("/login",(req,res)=>{
  let [lmail,lpass]=[req.body.email,req.body.pass]
  console.log(lmail+" "+lpass)
  if(!conn._connectCalled ) 
{
conn.connect();
}
       let sql_id=`select count(id) as cl_id from Users where email_id='${lmail}' and password='${lpass}'`
       conn.query(sql_id,(err,iscount)=>{
          if(err) throw err
          else if(iscount[0].cl_id==1){
        let chk_id=`select token,verified from Users where email_id='${lmail}' and password='${lpass}'`
        conn.query(chk_id,(err, value)=>{
          if(err) throw err
          else{
            let object={
              status:"ok", 
              token:value[0].token,
              verified:value[0].verified,
              email:lmail
            }
           console.log(value)
            let json_data=JSON.stringify(object);
            res.send(json_data);
            console.log(json_data)
          }
        }) 
      }
      else{
        res.send("Not_found")
      }
})
})

//to reset password
app.get("/forgetpassword",(rew,res)=>{
  res.sendFile(path.join(__dirname,"/public/forgetpass.html"))
})

app.post("/forgetpasswd",(req,res)=>{
  let [rmail,rpass]=[req.body.email,req.body.pass]
  var ftoken=""
  var fnumbers="0123456789";
  for(let i=0;i<6;i++){
    ftoken+=fnumbers[Math.floor(Math.random()*10)];
  }
  console.log(rmail+" "+rpass)
  if(!conn._connectCalled ) 
{
conn.connect();
}
let count2_sql=`select count(id) as count_no from Users where email_id='${rmail}'`
conn.query(count2_sql,(err,rows)=>{
      if(err) throw err;
      else if(rows[0].count_no==1){
        mailer.forget_pass(rmail,ftoken);
      conn.query(`update Users set otp=${ftoken} where email_id='${rmail}'`)
        console.log("verified");
        res.send("OTP send")
      }
      else{
        res.send("Id not found");
        console.log("Id not found");
      }
  })
})

//to verify otp
app.post("/verify_otp",(req,res)=>{
  let [remail,repass,reotp]=[req.body.email,req.body.pass,req.body.otp]
  console.log(req)
  if(!conn._connectCalled ) 
{
conn.connect();
}
var sql_st=`select otp from Users where email_id='${remail}'`;
conn.query(sql_st,(err,value)=>{
  let res_obj=value[0].otp
  console.log(res_obj+" "+reotp);
  if(res_obj==reotp){
    let sql_st2=`update Users set password='${repass}' where email_id='${remail}'`;
    conn.query(sql_st2,(err, rows)=>{
      if(err) throw err;
      console.log("password changed")
    res.send("password changed");
    });
  }
  else{
    res.send("OTP not matched! ")
  }
})

})

app.listen(3000)
