from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, DECIMAL, Boolean
from sqlalchemy.orm import relationship
from app.db_config import Base

# -------------------- Users --------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('citizen', 'distributor', 'official', 'admin'), nullable=False)
    role_id = Column(Integer, nullable=True)


# -------------------- Warehouses --------------------
class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    location = Column(String(255))


# -------------------- Food Aid Items --------------------
class FoodAidItem(Base):
    __tablename__ = "food_aid_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    quantity = Column(Integer)


# -------------------- Shipments --------------------
class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    aid_item_id = Column(Integer, ForeignKey("food_aid_items.id"))
    item_type = Column(String(100))
    quantity_kg = Column(DECIMAL(10, 2))
    origin_id = Column(Integer, ForeignKey("warehouses.id"))
    destination_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String(50))
    priority_level = Column(String(50))
    timestamp = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)


# -------------------- Issues --------------------
class Issue(Base):
    __tablename__ = "issues"
    issue_id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    issue_reported = Column(Boolean)
    issue_type = Column(String(100))
    report_timestamp = Column(DateTime)
    anonymous_report = Column(Boolean)


# -------------------- Feedbacks --------------------
class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    feedback_type = Column(String(50))
    comment = Column(Text)
    anonymous = Column(Boolean)
    submitted_at = Column(DateTime)


# -------------------- Audit Trails --------------------
class AuditTrail(Base):
    __tablename__ = "audit_trails"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50), nullable=False)
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=False)
    old_values = Column(String(500))
    new_values = Column(String(500))
    timestamp = Column(DateTime)
