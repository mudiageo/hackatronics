from sqlmodel import SQLModel, Session, create_engine
from app.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session

# def init_db():
#     import app.models  # noqa
#     SQLModel.metadata.create_all(engine)
