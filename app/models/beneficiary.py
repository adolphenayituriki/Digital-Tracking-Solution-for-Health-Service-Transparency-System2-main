# app/models/beneficiary.py
from sqlalchemy import Column, BigInteger, String, Date, TIMESTAMP, Text, func
from app.db_config import Base

class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    beneficiary_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    phone_number = Column(String(20), nullable=True)
    national_id = Column(String(50), unique=True, nullable=True, index=True)
    village = Column(String(100), nullable=False)
    cell = Column(String(100), nullable=False)
    sector = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    registration_date = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=True)
    qr_code = Column(String(255), unique=True, nullable=True)
    last_aid_received = Column(TIMESTAMP, nullable=True)
    feedback_status = Column(String(20), nullable=True, server_default="Pending")
    notes = Column(Text, nullable=True)
