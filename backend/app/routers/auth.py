from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import uuid

from app.models import UserCreate, User, Token, LoginRequest
from app.database import get_supabase

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    supabase = get_supabase()
    response = supabase.table("users").select("*").eq("email", email).execute()

    if not response.data:
        raise credentials_exception

    user_data = response.data[0]
    return User(**user_data)

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    supabase = get_supabase()

    # Check if user already exists
    existing_user = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user_data = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "username": user.username,
        "hashed_password": get_password_hash(user.password),
        "created_at": datetime.utcnow().isoformat()
    }

    response = supabase.table("users").insert(user_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    created_user = response.data[0]
    return User(
        id=created_user["id"],
        email=created_user["email"],
        username=created_user["username"],
        created_at=datetime.fromisoformat(created_user["created_at"])
    )

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    supabase = get_supabase()

    # Find user by email
    response = supabase.table("users").select("*").eq("email", credentials.email).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = response.data[0]

    if not verify_password(credentials.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["email"]}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user
