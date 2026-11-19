import uuid
from datetime import datetime, timezone
from typing import List

from pydantic import BaseModel, Field


def _nuevo_id() -> str:
    return f"pue-{uuid.uuid4().hex[:8]}"


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class Parada(BaseModel):
    id: str = Field(default_factory=_nuevo_id)
    nombre: str
    colonia: str
    municipio: str = "Puebla"
    latitud: float = Field(ge=-90, le=90)
    longitud: float = Field(ge=-180, le=180)
    rutas: List[str] = Field(default_factory=list)
    activa: bool = True
    creado_en: datetime = Field(default_factory=_ahora)
