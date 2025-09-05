from sqlalchemy import Column, BigInteger, String, TIMESTAMP, Float
from app.db_config import Base

class Shipment(Base):
    __tablename__ = "shipments"
    
    shipment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    truck_number = Column(String(50), nullable=False)
    sector = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)  # e.g., Completed, Pending, Delayed
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    dispatched_at = Column(TIMESTAMP, nullable=True)
    delivered_at = Column(TIMESTAMP, nullable=True)
