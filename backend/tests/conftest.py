"""Install fail-closed service boundaries before any application import."""
import os
import socket
from unittest.mock import patch

import pytest
import boto3
import dotenv
import pymongo
from google import genai


class LocalMongo:
    """Only import-time database selection, ping and index creation are allowed."""
    def __init__(self, *args, **kwargs):
        pass

    def __getitem__(self, name):
        return self

    @property
    def admin(self):
        return self

    def command(self, name):
        assert name == "ping"
        return {"ok": 1}

    def create_index(self, *args, **kwargs):
        return "local-test-index"

    def __getattr__(self, name):
        raise AssertionError(f"Unexpected database operation: {name}")


class BlockedService:
    def __getattr__(self, name):
        raise AssertionError(f"Unexpected external service operation: {name}")


def deny_network(*args, **kwargs):
    raise AssertionError("Outbound network connections are forbidden in unit tests")


# Session-wide patches must precede test module collection (and imports of main).
_patches = [
    patch.dict(os.environ, {
        "ENVIRONMENT": "test",
        "MONGODB_URI": "mongodb://127.0.0.1:27017",
        "DB_NAME": "versa_unit_tests",
        "ORG_DB_NAME": "versa_org_unit_tests",
        "JWT_SECRET": "unit-test-only-jwt-value-never-use-outside-tests",
        "API_KEY_SECRET": "unit-test-only-api-hashing-value",
        "DO_ACCESS_KEY_ID": "unit-test-storage-id",
        "DO_SECRET_KEY": "unit-test-storage-value",
        "ENDPOINT": "https://storage.invalid",
        "SPACENAME": "unit-tests",
        "GOOGLE_API_KEY": "",
        "STRIPE_SECRET_KEY": "",
        "FRONTEND_URL": "http://localhost:3000",
        "AWS_EC2_METADATA_DISABLED": "true",
    }, clear=True),
    patch.object(dotenv, "load_dotenv", return_value=False),
    patch.object(pymongo, "MongoClient", LocalMongo),
    patch.object(boto3, "client", return_value=BlockedService()),
    patch.object(genai, "Client", return_value=BlockedService()),
    patch.object(socket.socket, "connect", deny_network),
    patch.object(socket.socket, "connect_ex", deny_network),
    patch.object(socket, "create_connection", deny_network),
]
for _patch in _patches:
    _patch.start()


def pytest_unconfigure(config):
    for active_patch in reversed(_patches):
        active_patch.stop()


@pytest.fixture(autouse=True)
def clean_auth_overrides():
    from main import app
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()
