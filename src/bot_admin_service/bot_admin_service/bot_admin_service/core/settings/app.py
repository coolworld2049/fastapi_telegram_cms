import logging
import os
import pathlib
from typing import Any, Optional

from pydantic import validator
from pydantic.networks import PostgresDsn
from starlette.templating import Jinja2Templates

from bot_admin_service.core.settings.base import BaseAppSettings, StageType


class BotSettings(BaseAppSettings):
    BOT_OWNER_ID: int
    BOT_TOKEN: str
    WEBHOOK_ENDPOINT: Optional[str]

    @property
    def webhook_url(self):
        return f"{self.WEBHOOK_ENDPOINT}{self.api_prefix}/bot{self.BOT_TOKEN}"


class RedisSettings(BaseAppSettings):
    REDIS_MASTER_HOST: str
    REDIS_MASTER_PORT_NUMBER: Optional[int] = 6379
    REDIS_USERNAME: Optional[str] = "default"
    REDIS_PASSWORD: Optional[str]

    @property
    def redis_url(self):
        password = (
            f"{self.REDIS_USERNAME}:{self.REDIS_PASSWORD}@"
            if self.REDIS_PASSWORD
            else ""
        )
        return f"redis://{password}{self.REDIS_MASTER_HOST}:{self.REDIS_MASTER_PORT_NUMBER}/0"

    REDIS_OM_URL: Optional[str]


class AppSettings(BotSettings):
    USE_EMAILS: Optional[bool] = True if os.getenv("SMTP_PASSWORD") else False

    APP_NAME: Optional[str] = "bot_admin_service"
    APP_HOST: Optional[str] = "localhost"
    APP_PORT: Optional[int] = 8081
    APP_MODULE: Optional[str] = "bot_admin_service.main:app"
    STAGE: StageType
    APP_VERSION: Optional[str] = "latest"

    APP_BACKEND_CORS_ORIGINS: Optional[list[str]] = ["*"]
    JWT_ALGORITHM: Optional[str] = "HS256"
    JWT_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str
    FIRST_SUPERUSER_USERNAME: Optional[str]

    SMTP_HOST: Optional[str]
    SMTP_PORT: Optional[int]
    SMTP_USERNAME: Optional[str]
    SMTP_PASSWORD: Optional[str]
    SMTP_FROM: Optional[str]

    POSTGRESQL_MASTER_HOST: str
    POSTGRESQL_MASTER_PORT: int
    POSTGRESQL_DATABASE: str
    POSTGRESQL_USERNAME: str
    POSTGRESQL_PASSWORD: str

    SQLALCHEMY_PROFILE_QUERY_MODE: Optional[bool] = False

    LOGGING_LEVEL: Optional[int] = logging.INFO

    @validator("APP_BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | list[str]) -> str | list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        validate_assignment = True

    @property
    def fastapi_kwargs(self) -> dict[str, Any]:
        title = (
            self.APP_NAME
            + f"{f'_{self.STAGE.name}' if self.STAGE != StageType.prod else ''}"
        )
        return {
            "debug": True if self.LOGGING_LEVEL == logging.DEBUG else False,
            "docs_url": self.docs_url,
            "openapi_prefix": self.openapi_prefix,
            "openapi_url": self.openapi_url,
            "redoc_url": self.redoc_url,
            "title": title,
            "version": self.APP_VERSION,
        }

    @property
    def project_path(self):
        return pathlib.Path(__file__).parent.parent.parent

    @property
    def logs_path(self):
        return self.project_path / ".logs"

    @property
    def jinja_templates(self) -> Jinja2Templates:
        return Jinja2Templates(directory=self.project_path / "templates")

    @property
    def postgres_url(self) -> str:
        dsn = PostgresDsn.build(
            scheme="postgresql",
            user=self.POSTGRESQL_USERNAME,
            password=self.POSTGRESQL_PASSWORD,
            host=self.POSTGRESQL_MASTER_HOST,
            port=str(self.POSTGRESQL_MASTER_PORT),
            path=f"/{self.POSTGRESQL_DATABASE}",
        )
        return dsn

    @property
    def postgres_asyncpg_url(self) -> str:
        return self.postgres_url.replace("://", "+asyncpg://")
