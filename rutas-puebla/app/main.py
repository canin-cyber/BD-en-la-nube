from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import probar_conexion
from app.routes import router

app = FastAPI(
    title="Rutas Puebla",
    description="CRUD de paradas de transporte público en Puebla con Redis Cloud",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", include_in_schema=False)
def inicio():
    return FileResponse("static/index.html")


@app.get("/estado")
def estado():
    return {"proyecto": "Rutas Puebla", "redis_conectado": probar_conexion()}
