from sqlalchemy import create_engine, Column, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base

# Create SQLite engine
engine = create_engine("sqlite:///database.db", echo=False)

Session = sessionmaker(bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    name = Column(String, primary_key=True)
    price = Column(Float)

# Create DB if not exists
Base.metadata.create_all(engine)

def lookup_product(name):
    session = Session()
    product = session.query(Product).filter_by(name=name).first()
    session.close()
    return product

def insert_product(name, price):
    session = Session()

    # Avoid duplicate primary key errors
    existing = session.query(Product).filter_by(name=name).first()

    if not existing:
        product = Product(name=name, price=price)
        session.add(product)
        session.commit()


    session.close()

def search_products(query_str):
    session = Session()
    # Case-insensitive search
    results = session.query(Product).filter(Product.name.ilike(f"%{query_str}%")).limit(10).all()
    products = [{"name": p.name, "price": p.price} for p in results]
    session.close()
    return products
