from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class CompanyBase(BaseModel):
    name: str
    email: EmailStr


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


