from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db_config import Base, engine
from app.routes import beneficiary_routes
from app.routes import total_shipments
from app.routes import (
    auth_routes,
    warehouse_routes,
    shipment_routes,
    feedback_routes,
    distribution_center_routes,
    food_aid_item_routes
)
app = FastAPI(title="Digital Tracking Solution for Health Service Transparency")

# CORS
frontend_origins = [
    "http://localhost:3000",  # React/Dash frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth_routes.router, prefix="/auth")  # Keep /auth prefix here
app.include_router(warehouse_routes.router, prefix="/warehouses", tags=["Warehouses"])
app.include_router(shipment_routes.router, prefix="/shipments", tags=["Shipments"])
app.include_router(feedback_routes.router, prefix="/feedbacks", tags=["Feedbacks"])
app.include_router(distribution_center_routes.router, prefix="/distribution_centers", tags=["Distribution Centers"])
app.include_router(food_aid_item_routes.router, prefix="/food_aid_items", tags=["Food Aid Items"])
app.include_router(beneficiary_routes.router, prefix="/beneficiaries")
app.include_router(total_shipments.router)
print("Registered routes:")
for route in app.routes:
    print(route.path, "-", route.name)
