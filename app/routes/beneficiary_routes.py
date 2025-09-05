# app/routes/beneficiary_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db_config import get_db
from app.models.beneficiary import Beneficiary

router = APIRouter(tags=["Beneficiaries"])

@router.get("/total")
def total_beneficiaries(db: Session = Depends(get_db)):
    """
    Returns the total number of beneficiaries in the database.
    """
    total = db.query(Beneficiary).count()
    return {"total": total}

@router.get("/all")
def get_all_beneficiaries(db: Session = Depends(get_db)):
    """
    Returns a list of all beneficiaries with details.
    """
    beneficiaries = db.query(Beneficiary).all()
    result = [
        {
            "id": b.beneficiary_id,
            "first_name": b.first_name,
            "last_name": b.last_name,
            "phone_number": b.phone_number,
            "village": b.village,
            "cell": b.cell,
            "sector": b.sector,
            "district": b.district,
        }
        for b in beneficiaries
    ]
    return result
