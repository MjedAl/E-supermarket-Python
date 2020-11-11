#Imports
import json
from flask import Flask, request, render_template, jsonify, abort
from functools import wraps
from modals import db_drop_and_create_all, setup_db, Product

#App configuration
app = Flask(__name__)
setup_db(app)

#db_drop_and_create_all()

@app.route('/')
def get_main_page():
    products = Product.query.all()
    return render_template('index.html', products=[product.short() for product in products]) 

@app.route('/product', methods=['get'])
def get_product():
    products = Product.query.all()
    return jsonify({
        'success': True,
        'products': [product.short() for product in products]
    })

@app.route('/product', methods=['POST'])
def new_product():
    jsonBody = request.get_json()
    id = jsonBody.get('id')
    price = jsonBody.get('price')
    quantity = jsonBody.get('quan')
    name = jsonBody.get('des')
    image_link = jsonBody.get('picUrl')
    try:
        product = Product(id=id, price=price, quantity=quantity, name=name, image_link=image_link)
        product.insert()
        return jsonify({'success': True})
    except:
         abort(400)

@app.route('/product/<id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if product is None:
        abort(404)
    product.delete()
    return jsonify({'success': True})


@app.route('/product', methods=['PATCH'])
def edit_product():
    try:
        jsonBody = request.get_json()
        id = jsonBody.get('id')
        product = Product.query.get(id)
        if product is None:
            abort(404)

        price = jsonBody.get('price')
        print(price)
        if price:
            product.price=price

        quantity = jsonBody.get('quan')
        if quantity:
            product.quantity=quantity

        name = jsonBody.get('des')
        if name:
            product.name=name

        image_link = jsonBody.get('picUrl')
        if image_link:
            product.image_link=image_link

        product.update()
        return jsonify({'success': True})
    except:
        abort(400)

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "success": False,
        "error": 400,
        "message": "Bad request"
    }), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": 404,
        "message": "Not found"
    }), 404