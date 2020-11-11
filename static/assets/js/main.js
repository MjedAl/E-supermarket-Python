// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyBSlJBpa5QsSJhBrnbHfqHgCaGVFJrz60I",
  authDomain: "playground-bf320.firebaseapp.com",
  databaseURL: "https://playground-bf320.firebaseio.com",
  projectId: "playground-bf320",
  storageBucket: "playground-bf320.appspot.com",
  messagingSenderId: "429132353023",
  appId: "1:429132353023:web:719b296b0a8c7855022bca",
  measurementId: "G-FY89N76JFF"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var firebaseStorage = firebase.storage();
var storageRef = firebaseStorage.ref();

if (window.top.location.pathname === "/index.html" || window.top.location.pathname === "/" || window.top.location.pathname === "/E-Supermarket/") {
  loadProducts();
} else if (window.top.location.pathname === "/products.html" || window.top.location.pathname === '/E-Supermarket/products.html') {
  // if (!isUserSignedIn()) {
  //   window.location.pathname = '/login.html';
  // }
}

function isUserSignedIn() {
  if ((firebase.auth().currentUser) == null) {
    return false;
  } else {
    return true;
  }
}

function logInButton() {
  var email = document.getElementById("emailInput").value;
  var password = document.getElementById("passwordInput").value;
  if (email == "") {
    Msg.error("Please fill the email", 2500);
    return;
  }
  if (password == "") {
    Msg.error("Please fill the password", 2500);
    return;
  }
  var rememberUser = document.getElementById("formCheck-1").checked;

  if (rememberUser) {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(function() {
        return firebase.auth().signInWithEmailAndPassword(email, password);
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        handleErrors(errorCode, errorMessage);
        return;
      });
  } else {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(function() {
        return firebase.auth().signInWithEmailAndPassword(email, password);
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        handleErrors(errorCode, errorMessage);
        return;
      });
  }
}

function logOut() {
  firebase.auth().signOut().then(function() {
    alert('Logged out');
  }, function(error) {
    handleErrors(error, error);
  });
}

function handleErrors(errorCode, errorMessage) {
  console.log("Error: " + errorCode)
  Msg.error(errorMessage, 5000);
  // To-Do: switch to handle error with nice print
}

function loadProducts(){
  return firebase.database().ref('products/').once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
       addProduct(childData.id ,childData.description,childData.price,childData.quantity,childData.pic);
    });

  });
}

function loadData() {
  var info = [];
  return firebase.database().ref('products/').once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      info.push({
        "id": childData.id,
        "description": childData.description,
        "quantity": childData.quantity,
        "price": childData.price,
        "pic": childData.pic
      });
    });

    var table = $('#productsTable').DataTable({
      data: info,
      columns: [
        {
          data: 'id'
        },
        {
          data: 'description'
        },
        {
          data: 'quantity'
        },
        {
          data: 'price'
        },
        {
          defaultContent: "<button>View picture</button>"
        }
      ]
    });

    $('#productsTable tbody').on('click', 'button', function() {
      var data = table.row($(this).parents('tr')).data();
      buildModelAndView(data.id, data.pic);
    });
  });


}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    if (window.top.location.pathname == "/login.html" || window.top.location.pathname =="/register.html") {
      window.location.pathname = '/'
    }else if (window.top.location.pathname == '/E-Supermarket/login.html' || window.top.location.pathname == "/E-Supermarket/register.html"){
      window.location.pathname = '/E-Supermarket/'
    }
    // show user icon
    document.getElementById("userIcon").classList.remove("hide");

    // TODO
    // check if user is admin:
    document.getElementById("adminPage").classList.remove("hide");


    // hide log in button
    document.getElementById("logInButton").classList.add("hide");
    document.getElementById("SignUpButton").classList.add("hide");

    if (window.top.location.pathname == "/products.html" || window.top.location.pathname == "/E-Supermarket/products.html") {
      loadData();
    }

  } else {
    if (window.top.location.pathname == "/products.html") {
      window.location.pathname = '/E-Supermarket/'
    }
  }
});

function buildModelAndView(id, loc) {
  if ($("#" + id).length > 0) {
    $("#" + id).modal();
  } else {
    if (loc == "null") {
      Msg.error("No picture is found", 2500);
    } else {
      var imgRef = storageRef.child('/images/' + loc);

      imgRef.getDownloadURL().then(function(url) {
        var modalHTML = '<div id=' + id + ' role="dialog" tabindex="-1" class="modal fade">' +
          '    <div class="modal-dialog" role="document">' +
          '        <div class="modal-content">' +
          '            <div class="modal-header">' +
          '                <h4 class="modal-title" > ID: ' + id + '</h4><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button></div>' +
          '            <div class="modal-body"><img src=' + url + ' width="100%" height="100%" /></div>' +
          '            <div class="modal-footer"><button class="btn btn-light" type="button" data-dismiss="modal">Close</button></div>' +
          '        </div>' +
          '    </div>' +
          '</div>';

        $('#wrapper').append(modalHTML);
        $("#" + id).modal();

      }).catch(function(error) {
        handleErrors(error.code, error.message)
      });
    }
  }
}

function addProduct(id, description, price, quantity, imageSrc){

  var imgRef = storageRef.child('/images/' + imageSrc);

  imgRef.getDownloadURL().then(function(url) {
    var cardHTML = '<div class="col-md-6 col-xl-3 mb-4">'+
    '    <div class="card shadow border-left-primary py-2">'+
    '        <div class="card-body">'+
    '            <div class="row align-items-center no-gutters">'+
    '                <div class="col mr-2">'+
    '                    <div class="text-uppercase text-primary font-weight-bold text-xs mb-1"><span>'+description+'</span></div>'+
    '                    <div class="text-dark font-weight-bold h5 mb-0"><span>Price: $'+price+'</span></div>'+
    '                    <div class="text-dark font-weight-bold h6 mb-0"><span>Quantity: '+quantity+'</span></div>'+
    '                </div>'+
    '                <div class="col-auto"><img src="'+url+'" style="max-width: 100px;max-height: 100px;" /></div>'+
    '            </div>'+
    '            <div class="row d-flex justify-content-center no-gutters" style="padding-top: 5%;">'+
    '                <div class="col-auto text-center"><input class="form-control-sm" type="number" id="product_'+id+'_Q" min="1" max="'+quantity+'" value="1" step="0" placeholder="1" /><button class="btn btn-primary" type="button" onclick="addToCart('+id+', \''+description+'\', '+price+', \''+url+'\')">Add to cart</button></div>'+
    '            </div>'+
    '        </div>'+
    '    </div>'+
    '</div>';
    $("#productsRow").append(cardHTML);
    

  }).catch(function(error) {
    handleErrors(error.code, error.message)
  });

}

function addProductButton() {
  // check all stuff
  var id = document.getElementById("productID").value;
  var quan = document.getElementById("productQuantity").value;
  var des = document.getElementById("productDesc").value;
  var price = document.getElementById("productPrice").value;
  var pic = document.getElementById("productPicture").value;
  var pictureFileName = $("#productPicture")[0].files[0].name;
  var picLoc = id + "/" + pictureFileName;

  if (id == "") {
    alert("Please fill the ID");
    return;
  } else if (quan == "") {
    alert("Please fill the quantity");
    return;
  } else if (des == "") {
    alert("Please fill the description");
    return;
  } else if (price == "") {
    alert("Please fill the Price");
    return;
  } else if (pic == "") {
    alert("Please upload the picture");
    return;
  } else {
    // got everything.
    // upload data to Realtime database.

    firebase.database().ref('products/' + id).set({
      id: id,
      description: des,
      quantity: quan,
      price: price,
      pic: picLoc
    }, function(error) {
      if (error) {
        handleErrors(error, error);
        return;
      } else {
        // upload the picture
        var file = $("#productPicture")[0].files[0];
        var imageRef = storageRef.child('/images/' + id + "/" + pictureFileName);
        //Upload file
        var task = imageRef.put(file);

        task.on('state_changed',
          function progress(snapshot) {
          },
          function error(err) {
            handleErrors(err, err);
          },
          function complete() {
            Msg.success('Product added', 3000);
           document.getElementById("productID").value="";
           document.getElementById("productQuantity").value="";;
            document.getElementById("productDesc").value="";;
            document.getElementById("productPrice").value="";;
            document.getElementById("productPicture").value="";;
            $("#addProductModal"). modal("hide");
          });
      }
    });





  }
  // if there continue
}

function registerButton(){

  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  var emailAddress = document.getElementById("emailAddress").value;
  var password1 = document.getElementById("password1").value;
  var password2 = document.getElementById("password2").value;

  if (firstName == "" || lastName == "" || emailAddress == "" || password1 == "" || password2 == "") {
    Msg.error("Please fill the all inputs", 2500);
    return;
  }
  if (password1 != password2) {

    Msg.error("Passwords don't match!", 2500);
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(emailAddress, password1).then(function(user) {
    user.updateProfile({
        displayName: (firstName+' '+lastName)
    }).then(function() {
        // Update successful.
    }, function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        handleErrors(errorCode, errorMessage);
        // An error happened.
    });        
}, function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    handleErrors(errorCode, errorMessage);
});
}

let products = [];

function addToCart(id, name, price, pic){
  var productQuantity = document.getElementById("product_"+id+"_Q").value;

  if(localStorage.getItem('products')){ // user already have some products
      products = JSON.parse(localStorage.getItem('products')); // get it
  }
  products.push({
    'productId' : id,
    'name': name,
    'price': price,
    'quantity': productQuantity,
    'pic' : pic,
  });
  localStorage.setItem('products', JSON.stringify(products));
  AddProductToCartModal(id, name, price, pic, productQuantity);
  Msg.success('Product added', 2000);
}

loadCart();

function loadCart(){
  if(localStorage.getItem('products')){ // user already have some products
    products = JSON.parse(localStorage.getItem('products')); // get it
    products.forEach(p => {
      AddProductToCartModal(p.id, p.name, p.price, p.pic, p.quantity);
    });
  }
}

function openCartModal(){
  if (products === undefined || products.length == 0) {
    Msg.error("Cart is empty :)", 2000);
}else{
    $('#cartModal').modal('show')
  }
}

function AddProductToCartModal(id, name, price, pic, quantity){
  
var modalHTML = '<div id=carProduct_'+id+' class="container">'+
'    <div class="col mb-4">'+
'        <div class="card shadow border-left-primary py-2">'+
'            <div class="card-body">'+
'                <div class="row align-items-center no-gutters">'+
'                    <div class="col mr-2">'+
'                        <div class="text-uppercase text-primary font-weight-bold text-xs mb-1"><span>'+name+'</span></div>'+
'                        <div class="text-dark font-weight-bold h5 mb-0"><span>'+price+' SR</span></div>'+
'                        <div class="text-dark font-weight-bold h6 mb-0"><span> '+quantity+' Peaces</span></div>'+
'                    </div>'+
'                    <div class="col-auto"><img src="'+pic+'" style="max-width: 100px;max-height: 100px;" /></div>'+
'                </div>'+
'                <div class="row d-flex justify-content-center no-gutters" style="padding-top: 5%;">'+
'                    <div class="col-auto text-center"><span style="font-size: 25px;"> Total: '+(quantity*price)+' SR</span><button class="btn btn-danger" type="button" onclick="deleteFromCart('+id+')">Remove Item</button></div>'+
'                </div>'+
'            </div>'+
'        </div>'+
'    </div>'+
'</div>';
$("#CartModalBody").append(modalHTML);


}

function deleteFromCart(id){
  // removing product modal from cart
  var productModal = document.getElementById("carProduct_"+id);
  productModal.remove(); 
  // removing it from the products list
  for (let index = 0; index < products.length; index++) {
    if (products[index].id == id){
      products.splice(index, 1);
      break;
    }
  }

  // updating the storage
  localStorage.setItem('products', JSON.stringify(products));
  Msg.success('Product deleted', 2000);
}