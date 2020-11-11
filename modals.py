import os
from sqlalchemy import Column, String, Integer
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

import json

# database_filename = "database.db"
# project_dir = os.path.dirname(os.path.abspath(__file__))
# DATABASE_URL = "sqlite:///{}".format(os.path.join(project_dir, database_filename))

DATABASE_URL = [os.getenv('DATABASE_URL')]
db = SQLAlchemy()

'''
setup_db(app)
    binds a flask application and a SQLAlchemy service
'''


def setup_db(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.app = app
    db.init_app(app)
    Migrate(app, db)
    db.create_all()



'''
db_drop_and_create_all()
    drops the database tables and starts fresh
    can be used to initialize a clean database
    !!NOTE you can change the database_filename variable to have multiple
     verisons of a database
'''


def db_drop_and_create_all():
    db.drop_all()
    db.create_all()


class Product(db.Model):
    id = Column(Integer, primary_key=True)
    price = Column(Integer)
    name = Column(String())
    quantity = Column(Integer)
    image_link = db.Column(db.String(500))


    def short(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'quantity': self.quantity,
            'image_link': self.image_link
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return json.dumps(self.short())

