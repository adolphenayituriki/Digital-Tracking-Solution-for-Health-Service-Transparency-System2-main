import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole
from app.db_config import DATABASE_URL
from app.utils.security import hash_password

def create_test_user():
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.username == "test_citizen").first()
        if existing_user:
            print("Test user already exists:")
            print(f"Username: {existing_user.username}")
            print(f"Role: {existing_user.role.value}")
            return
        
        # Create test citizen user
        hashed_pw = hash_password("test_password")
        test_user = User(
            username="test_citizen",
            password_hash=hashed_pw,
            role=UserRole.citizen
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("Test user created successfully:")
        print(f"Username: {test_user.username}")
        print(f"Password: test_password")
        print(f"Role: {test_user.role.value}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()