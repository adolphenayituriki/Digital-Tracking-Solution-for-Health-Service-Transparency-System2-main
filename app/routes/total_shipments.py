from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db_config import get_db
from app.models.food_aid import Shipment

router = APIRouter(
    prefix="/total-shipments",
    tags=["Total Shipments"]
)

@router.get("/")
def get_total_shipments(db: Session = Depends(get_db)):
    """
    Returns only the total number of shipments
    """
    total = db.query(Shipment).count()
    return {"total_shipments": total}
