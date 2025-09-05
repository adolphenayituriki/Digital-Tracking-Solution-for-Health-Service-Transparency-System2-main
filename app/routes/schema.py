from pydantic import BaseModel
from enum import Enum

# -----------------------
# Request Schemas
# -----------------------
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # "citizen", "distributor", "official"

# -----------------------
# Response Schemas
# -----------------------
class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True  # For SQLAlchemy V2 compatibility
