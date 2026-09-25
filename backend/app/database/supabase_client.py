import uuid
from typing import Optional, Dict, List, Any
from app.config.settings import settings

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    Client = Any

class SupabaseFallback:
    def __init__(self):
        self._store: Dict[str, List[Dict[str, Any]]] = {}

    def table(self, name: str):
        if name not in self._store:
            self._store[name] = []
        return TableMock(self._store[name])

class TableMock:
    def __init__(self, data_list):
        self.data_list = data_list
        self._query = []

    def select(self, *args, **kwargs):
        return self

    def execute(self):
        return type("Response", (), {"data": self.data_list})()

    def insert(self, data):
        if isinstance(data, dict):
            if "id" not in data:
                data["id"] = str(uuid.uuid4())
            self.data_list.append(data)
            return type("Response", (), {"data": [data]})()
        return type("Response", (), {"data": []})()

def get_supabase_client() -> Optional[Client | SupabaseFallback]:
    if HAS_SUPABASE and settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return SupabaseFallback()

def get_db():
    return get_supabase_client()
