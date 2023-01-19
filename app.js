//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
//const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name : String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to Todolist"
});
const item2 = new Item({
  name : "Hit add(+)button to add new Item"
});
const item3 = new Item({
  name : "Hit <-- to delete this Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String ,
  items : [itemsSchema]
};

const List = mongoose.model("List" , listSchema);
/*

Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Successfully saved items to the database");
  }
});

*/


const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, function(err, results){
if(results.length == 0)
{
  Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully saved items to the database");
    }
  });
  res.redirect("/");
}else{
  console.log(results);
  res.render("list", {listTitle: "Today", newListItems: results});
}
});
});
//const day = date.getDate();

//  res.render("list", {listTitle: "Today", newListItems: items});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

if(listName == "Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name: listName}, function(err, workItems){
    workItems.items.push(item);
    workItems.save();
  res.redirect("/" + listName);
  });
}

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName == "Today")
    {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
        console.log("Item Successfully Removed.");
        res.redirect("/");
        }
      });
    }
    else
    {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}, function(err, workItems){
        if(!err){
          res.redirect("/" + listName);
        }
      });

    }

});
/*
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
*/
/*
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});
*/
app.get("/:customListName", function(req,res){
const customListName = req.params.customListName;
// const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,workItems){
  if(!err){
    if(!workItems){
    //  console.log("Doesn't Exist");
    //create a new list
    const list = new List({
      name : customListName,
      items : defaultItems
    });
    list.save();
    res.redirect("/");
    }
    else{
    //  console.log("Exists");
      res.render("list", {listTitle: workItems.name, newListItems: workItems.items});
    }
    }
});


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
