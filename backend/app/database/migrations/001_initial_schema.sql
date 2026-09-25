-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    world_size_x INTEGER DEFAULT 8000,
    world_size_z INTEGER DEFAULT 8000,
    seed BIGINT DEFAULT 42,
    currency TEXT DEFAULT 'MC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Districts
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    development_level FLOAT DEFAULT 0.5,
    population INTEGER DEFAULT 0,
    area FLOAT DEFAULT 0,
    land_value FLOAT DEFAULT 0,
    average_income FLOAT DEFAULT 0,
    housing_capacity INTEGER DEFAULT 0,
    employment_capacity INTEGER DEFAULT 0,
    education_access FLOAT DEFAULT 0.5,
    healthcare_access FLOAT DEFAULT 0.5,
    transport_access FLOAT DEFAULT 0.5,
    safety FLOAT DEFAULT 0.5,
    environment_quality FLOAT DEFAULT 0.5,
    infrastructure_quality FLOAT DEFAULT 0.5,
    bounds JSONB,
    color TEXT DEFAULT '#888888',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure (unified)
CREATE TABLE IF NOT EXISTS infrastructure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(id),
    type TEXT NOT NULL,
    subtype TEXT,
    name TEXT,
    position JSONB,
    geometry JSONB,
    metadata JSONB,
    condition FLOAT DEFAULT 1.0,
    capacity INTEGER DEFAULT 100,
    construction_cost FLOAT DEFAULT 0,
    maintenance_cost FLOAT DEFAULT 0,
    operating_cost FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roads
CREATE TABLE IF NOT EXISTS roads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    road_type TEXT NOT NULL,
    start_node_id TEXT,
    end_node_id TEXT,
    lanes INTEGER DEFAULT 2,
    speed_limit FLOAT DEFAULT 50,
    capacity INTEGER DEFAULT 1000,
    length FLOAT DEFAULT 0,
    condition FLOAT DEFAULT 1.0,
    geometry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Road nodes
CREATE TABLE IF NOT EXISTS road_nodes (
    id TEXT PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    x FLOAT NOT NULL,
    z FLOAT NOT NULL,
    node_type TEXT DEFAULT 'intersection',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(id),
    building_type TEXT NOT NULL,
    name TEXT,
    x FLOAT NOT NULL,
    z FLOAT NOT NULL,
    width FLOAT DEFAULT 10,
    depth FLOAT DEFAULT 10,
    height FLOAT DEFAULT 10,
    floors INTEGER DEFAULT 1,
    capacity INTEGER DEFAULT 0,
    occupancy INTEGER DEFAULT 0,
    condition FLOAT DEFAULT 1.0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transit lines
CREATE TABLE IF NOT EXISTS transit_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    line_type TEXT NOT NULL,
    color TEXT DEFAULT '#FF0000',
    capacity INTEGER DEFAULT 300,
    frequency_minutes INTEGER DEFAULT 5,
    route JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transit stations
CREATE TABLE IF NOT EXISTS transit_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    line_id UUID REFERENCES transit_lines(id),
    name TEXT NOT NULL,
    station_type TEXT NOT NULL,
    x FLOAT NOT NULL,
    z FLOAT NOT NULL,
    capacity INTEGER DEFAULT 500,
    passenger_count INTEGER DEFAULT 0,
    service_radius FLOAT DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citizens
CREATE TABLE IF NOT EXISTS citizens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(id),
    household_id UUID,
    age INTEGER DEFAULT 30,
    occupation TEXT DEFAULT 'worker',
    income FLOAT DEFAULT 30000,
    preferred_transport TEXT DEFAULT 'bus',
    vehicle_ownership BOOLEAN DEFAULT FALSE,
    satisfaction FLOAT DEFAULT 0.7,
    stress FLOAT DEFAULT 0.3,
    health FLOAT DEFAULT 0.8,
    home_x FLOAT,
    home_z FLOAT,
    work_x FLOAT,
    work_z FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    balance FLOAT DEFAULT 50000000,
    income_breakdown JSONB,
    expense_breakdown JSONB,
    net_monthly FLOAT DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    changes JSONB,
    is_baseline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation runs
CREATE TABLE IF NOT EXISTS simulation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id),
    seed BIGINT DEFAULT 42,
    status TEXT DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Metrics
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES simulation_runs(id) ON DELETE CASCADE,
    tick INTEGER DEFAULT 0,
    population INTEGER DEFAULT 0,
    satisfaction FLOAT DEFAULT 0.5,
    budget_balance FLOAT DEFAULT 0,
    traffic_index FLOAT DEFAULT 0.5,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
