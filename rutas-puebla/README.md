# 🚌 Rutas Puebla – Sprint 1

API CRUD de paradas de transporte público de Puebla (FastAPI + Redis Cloud) con frontend HTML/CSS/JS y mapa Leaflet.

## Requisitos
- Python 3.11+
- Una base de datos en Redis Cloud (plan gratuito sirve)

## Instalación
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuración
1. En Redis Cloud abre tu base de datos → **Connect** y copia endpoint, usuario y contraseña.
2. Copia `.env.example` a `.env` y completa:
```
REDIS_URL=rediss://default:TU_PASSWORD@TU_HOST:PUERTO
```
> Si tu base **no** tiene TLS activado usa `redis://` en lugar de `rediss://`.

## Ejecución
```bash
uvicorn app.main:app --reload
```
- Aplicación: http://127.0.0.1:8000/
- Swagger: http://127.0.0.1:8000/docs
- Estado de Redis (PING): http://127.0.0.1:8000/estado

## Endpoints
| Método | Ruta | Acción |
|---|---|---|
| POST | /paradas | Crear parada |
| GET | /paradas | Listar paradas |
| GET | /paradas/{id} | Obtener una parada |
| PUT | /paradas/{id} | Actualizar parada |
| DELETE | /paradas/{id} | Eliminar parada |

## Modelo (clave `parada:{id}`)
```json
{
  "id": "pue-001", "nombre": "Parada Zócalo", "colonia": "Centro",
  "municipio": "Puebla", "latitud": 19.0431, "longitud": -98.1937,
  "rutas": ["Ruta 1", "Ruta 15", "Ruta 72"], "activa": true,
  "creado_en": "2026-11-08T23:00:00Z"
}
```
