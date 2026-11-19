import json

from fastapi import APIRouter, HTTPException

from app.database import redis_client
from app.models import Parada

router = APIRouter(prefix="/paradas", tags=["Paradas"])


def _clave(parada_id: str) -> str:
    return f"parada:{parada_id}"


@router.post("", status_code=201)
def crear_parada(parada: Parada):
    clave = _clave(parada.id)
    if redis_client.exists(clave):
        raise HTTPException(status_code=409, detail="La parada ya existe")
    redis_client.set(clave, parada.model_dump_json())
    return {"mensaje": "Parada creada", "id": parada.id}


@router.get("")
def listar_paradas():
    claves = list(redis_client.scan_iter(match="parada:*"))
    paradas = []
    if claves:
        for dato in redis_client.mget(claves):
            if dato:  # pudo borrarse entre el scan y el mget
                paradas.append(json.loads(dato))
    paradas.sort(key=lambda p: p.get("creado_en", ""))
    return {"total": len(paradas), "paradas": paradas}


@router.get("/{parada_id}")
def obtener_parada(parada_id: str):
    datos = redis_client.get(_clave(parada_id))
    if not datos:
        raise HTTPException(status_code=404, detail="Parada no encontrada")
    return json.loads(datos)


@router.put("/{parada_id}")
def actualizar_parada(parada_id: str, parada: Parada):
    clave = _clave(parada_id)
    actual = redis_client.get(clave)
    if not actual:
        raise HTTPException(status_code=404, detail="Parada no encontrada")
    parada.id = parada_id  # el ID de la URL manda
    parada.creado_en = Parada(**json.loads(actual)).creado_en  # conserva fecha original
    redis_client.set(clave, parada.model_dump_json())
    return {"mensaje": "Parada actualizada", "parada": parada}


@router.delete("/{parada_id}")
def eliminar_parada(parada_id: str):
    clave = _clave(parada_id)
    if not redis_client.exists(clave):
        raise HTTPException(status_code=404, detail="Parada no encontrada")
    redis_client.delete(clave)
    return {"mensaje": "Parada eliminada", "id": parada_id}
