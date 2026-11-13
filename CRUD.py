import os
import redis
import json
from dotenv import load_dotenv




load_dotenv()

redis_client = redis.Redis(

host=os.getenv("redis_host"),
port=int(os.getenv("redis_port")),
username=os.getenv("redis_username"),
password=os.getenv("redis_password"),
ssl=False,
decode_responses=True
)

print(redis_client.ping())

# ******************************************************************************************

r = redis.from_url(

os.getenv("REDIS_URL"),

decode_responses=True)

# CREATE

producto = { "id": 101, "nombre": "Laptop HP",
"precio": 18500.00}

r.set("producto:101", json.dumps(producto))

# *******************************************************************************************
# READ
datos = r.get("producto:101")

print(json.loads(datos))

# ******************************************************************************************
# UPDATE
producto["precio"] = 19900.00

r.set("producto:101", json.dumps(producto))

# *******************************************************************************************
# READ
datos = r.get("producto:101")

print(json.loads(datos))

# ******************************************************************************************
# DELETE
r.delete("producto:101")

