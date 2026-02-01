from utils.db import Session, Product, search_products

session = Session()
count = session.query(Product).count()
print(f"Total products: {count}")

print("First 5 products:")
products = session.query(Product).limit(5).all()
for p in products:
    print(f"- {p.name}: {p.price}")

print("\nTesting search for 'my':")
results = search_products("my")
print(results)
