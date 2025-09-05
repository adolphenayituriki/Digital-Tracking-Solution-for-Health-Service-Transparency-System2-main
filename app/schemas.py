from pydantic import BaseModel
from enum import Enum
from typing import Optional


class UserRole(str, Enum):
    citizen = "citizen"
    distributor = "distributor"
    official = "official"
    admin = "admin"
    super_admin = "super_admin"



# Used for registering a new user
class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole

# Used for logging in
class UserLogin(BaseModel):
    username: str
    password: str

# Response model for returning user info
class UserResponse(BaseModel):
    id: int
    username: str
    role: UserRole

    class Config:
        orm_mode = True
