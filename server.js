/*********************************************************************************
* web322 – Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Samarth Patel  Student ID: 150061208   Date: 28 November 2022
*
* Online cyclic URL:
* 
* https://samwebassignment3.herokuapp.com/
* 
*
********************************************************************************/ 

var express = require('express');
var v = require('path');
var ds = require('./data-service.js');
var bodyParser = require('body-parser');
const multer = require("multer");
const exphbs = require('express-handlebars');
const fs = require('fs');
var assignment = express();
assignment.use(express.json());
assignment.use(express.urlencoded({extended: true}));

var HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {console.log('server listening on: ' + HTTP_PORT);}



const storage = multer.diskStorage({destination: "./public/images/uploaded",filename: function (req, file, cb) {cb(null, Date.now() + v.extname(file.originalname));}});

const upload = multer({ storage: storage });

  
assignment.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main",
runtimeOptions: {allowProtoPropertiesByDefault: true,allowProtoMethodsByDefault: true,},
helpers:{
  
  navLink: function(link, opt){ return '<li' +  ((link == assignment.locals.activeRoute) ? ' class="active" ' : '') +  '><a href=" ' + link + ' ">' + opt.fn(this) + '</a></li>'; }, 

  equal: function (left, right, opt) { 
  
  if (arguments.length < 3) 
      throw new Error(); 
      
  if (arguments.length < 3 && arguments.length<0) 
      throw new Error(); 

  if (left != right) { 
      return opt.inverse(this); }

  if (arguments.length < 0) 
      throw new Error(); 

  if (left != right ) { return opt.inverse(this); }
  
  else {  return opt.fn(this); } 
}
}
}));
assignment.set('view engine', '.hbs');

assignment.use(express.static('public'));

assignment.use(function(r,res,another)
{
  let reqvalue = r.connect + r.baseUrl;
  assignment.locals.activeRoute = (reqvalue == "/") ? "/" : reqvalue.replace(/\/$/, "");another(); 
});




assignment.get('/', function(req, res) {res.render('home');});

assignment.get('/about', function(req, res) {res.render('about');});

assignment.get('/employees/add', function(req, res) {ds.getDepartments().then((data)=>{res.render("addEmployee", {departments:data});}).catch((err)=>{res.render("addEmployee",{departments:[]});});});

assignment.get('/images/add', function(req, res) {res.render('addImage');});

assignment.get('/employees', function(req, res) {

if(req.query.department){
  ds.getEmployeesByDepartment(req.query.department).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:""});}).catch(err => res.render({message: ""}));} 

else if(req.query.manager){
  ds.getEmployeesByManager(req.query.manager).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));} 
  
else if(req.query.employeeNum){ 
  ds.getEmployeeByNum(req.query.employeeNum).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));}

else if(req.query.status){
  ds.getEmployeesByStatus(req.query.status).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));}

else { ds.getAllEmployees().then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));}});

assignment.get("/images",function(req,res){
  fs.readdir("./public/images/uploaded", (err, i) => {
      for (var temprandomvalue=0; temprandomvalue<i.length; temprandomvalue++) { i[temprandomvalue];}
  return res.render("images",{images:i});  
 })
  });


assignment.post("/images/add", upload.single("imageFile"), (req, res) => {res.redirect("/images");});
  

assignment.post("/employees/add", (req, res) => {ds.addEmployee(req.body).then((ds) =>{res.redirect("/employees");});})


//assignment.get("/employees/delete/:empNum",(req,res)=>{ds.deleteEmployeeByNum(req.params.empNum).then(()=>{ redirect("/employees");}).catch((err)=>{res.status(500).send("Unable to Remove Employee / Employee not found")});});

assignment.get('/employees/delete/:num', (req,res) => {ds.deleteEmployeeByNum(req.params.num).then(res.redirect("/employees")).catch(err => res.status(500).send("Unable to Remove Employee / Employee not found"))});

assignment.get('/managers', function(req, res) { ds.getManagers().then((ds) => {res.render("departments",ds.length>0?{departments:ds}:{message:"No results."})});});

assignment.get('/departments', function(req, res) {ds.getDepartments().then((ds) => {res.render("departments", {departments: ds});}).catch(err => res.render({message: "no results"}));});

assignment.post("/employee/update", (req, res) => { ds.updateEmployee(req.body).then((ds) => {res.redirect("/employees");}).catch(err => res.render({message: "no results"}));});
assignment.post("/department/update",(req,res)=>{
  ds.updateDepartment(req.body).then(()=>{res.redirect("/departments");}).catch((err)=>{res.status(500).send("error");});});

assignment.get("/departments/add",(req,res)=>{res.render("addDepartment");});
assignment.post("/departments/add", (req, res)=>{
  ds.addDepartment(req.body).then(()=>{res.redirect("/departments");}).catch((err)=>{res.status(500).send("error.");});});

assignment.get("/department/:departmentId",(req,res)=>{ds.getDepartmentById(req.params.departmentId).then((info)=>{
  if (!info){res.status(404).send("error");}
  else{res.render("department",{department:info});}}).catch((err)=>{res.status(404).send("");})});

assignment.use(function (req, res) {res.sendFile(v.join(__dirname,'/views/error.html'));});


ds.initialize().then(function(ds){
  assignment.listen(HTTP_PORT, function(){console.log("server listening on " + HTTP_PORT)});}).catch(function(err){console.log("Unable to start server: " + err);});





