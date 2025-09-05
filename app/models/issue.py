from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db_config import Base
from datetime import datetime

class Issue(Base):
    __tablename__ = "issues"

    issue_id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)
    issue_reported = Column(Boolean, default=False)
    description = Column(Text)
    reported_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to shipment
    shipment = relationship("Shipment")

    def __repr__(self):
        return f"<Issue(id={self.issue_id}, shipment_id={self.shipment_id}, reported={self.issue_reported})>"
