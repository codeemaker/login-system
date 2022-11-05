
const mysql=require("mysql")

const conn=mysql.createConnection({
  host:"localhost", 
  user:"root", 
  password:"hello",
  database:"usrData"
})

const conn_sql=(name,email,password,token,verified)=>{
conn.connect((err) => {
  if(err){
    throw err
  }
  else{
    console.log("connected");
    let sql=`insert into Users (name,email_id,password,token,verified) values ('${name}','${email}','${password}','${token}','${verified}')`;
    conn.query(sql,(err)=>{
      if(err) throw err;
      else{
        console.log("Data stored");
      }
    })
  }
}) 

}

module.exports = { conn, conn_sql}