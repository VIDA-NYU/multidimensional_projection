 function User (){
   console.log("User----------");
  this.name='sonia';
  this.password='123';
};



User.prototype.getname = function(){
  console.log(this.name);
  return this.name;
};

export {User};
