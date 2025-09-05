from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db_config import get_db
from app.models import Shipment, Issue, Feedback, AuditTrail, Warehouse, FoodAidItem
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.routes import dashboard_routes

router = APIRouter()

# -------------------- KPI Data --------------------
@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_dispatched = db.query(func.count(Shipment.id)).scalar()
    total_delivered = db.query(func.count(Shipment.id)).filter(Shipment.status == "Delivered").scalar()
    delayed = db.query(func.count(Shipment.id)).filter(Shipment.status == "Delayed").scalar()
    lost = db.query(func.count(Shipment.id)).filter(Shipment.status == "Lost").scalar()
    issues_reported = db.query(func.count(Issue.issue_id)).filter(Issue.issue_reported == True).scalar()
    
    # Average transit time in hours
    shipments_with_time = db.query(Shipment).filter(Shipment.timestamp.isnot(None), Shipment.latitude.isnot(None), Shipment.longitude.isnot(None)).all()
    avg_transit_time = 0
    if shipments_with_time:
        total_hours = 0
        count = 0
        for s in shipments_with_time:
            # Example: using timestamp difference from now (replace with proper delivery time if available)
            hours = (datetime.utcnow() - s.timestamp).total_seconds() / 3600
            total_hours += hours
            count += 1
        avg_transit_time = total_hours / count if count else 0

    delivery_rate = (total_delivered / total_dispatched * 100) if total_dispatched else 0

    return {
        "total_dispatched": total_dispatched,
        "total_delivered": total_delivered,
        "delayed": delayed,
        "lost": lost,
        "issues_reported": issues_reported,
        "avg_transit_time": round(avg_transit_time, 2),
        "delivery_rate": round(delivery_rate, 2)
    }


# -------------------- Shipments with latest location --------------------
@router.get("/shipments")
def get_shipments(db: Session = Depends(get_db)):
    shipments = db.query(
        Shipment.id,
        Shipment.item_type,
        Shipment.quantity_kg,
        Shipment.origin_id,
        Shipment.destination_id,
        Shipment.status,
        Shipment.priority_level,
        Shipment.timestamp,
        Shipment.latitude,
        Shipment.longitude
    ).all()
    return shipments


# -------------------- Feedbacks --------------------
@router.get("/feedbacks")
def get_feedbacks(db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).all()
    return feedbacks


# -------------------- Issues --------------------
@router.get("/issues")
def get_issues(db: Session = Depends(get_db)):
    issues = db.query(Issue).all()
    return issues


# -------------------- Audit Trail --------------------
@router.get("/audit_trails")
def get_audit_trails(db: Session = Depends(get_db), limit: int = 5):
    audits = db.query(AuditTrail).order_by(AuditTrail.timestamp.desc()).limit(limit).all()
    return audits
