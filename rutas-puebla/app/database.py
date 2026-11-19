import os

import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise RuntimeError(
        "Falta la variable de entorno REDIS_URL. "
        "Crea el archivo .env con la cadena de conexión de Redis Cloud."
    )

# decode_responses=True -> redis-py devuelve str en lugar de bytes
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def probar_conexion() -> bool:
    """Devuelve True si Redis responde al PING."""
    try:
        return bool(redis_client.ping())
    except redis.exceptions.RedisError:
        return False
