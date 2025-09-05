import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db_config import Base, engine, get_db
from app.models.user import User, UserRole
from app.utils.security import hash_password

def init_database():
    """Initialize the database with required data including a system user for audit trails"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Check if system user already exists
        system_user = db.query(User).filter(User.username == "system").first()
        
        if not system_user:
            # Create system user for audit trail logging
            hashed_password = hash_password("system_password")  # In production, use a secure password
            system_user = User(
                username="system",
                password_hash=hashed_password,
                role=UserRole.official  # Using official role for system user
            )
            db.add(system_user)
            db.commit()
            print("System user created successfully")
        else:
            print("System user already exists")
            
        # Check if admin user exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            # Create default admin user
            hashed_password = hash_password("admin_password")  # In production, use a secure password
            admin_user = User(
                username="admin",
                password_hash=hashed_password,
                role=UserRole.official
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully")
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        # Close database connection
        try:
            db_gen.__next__()  # This will trigger the finally block in get_db()
        except StopIteration:
            pass

if __name__ == "__main__":
    init_database()