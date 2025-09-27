-- Create enum types
CREATE TYPE public.contract_status AS ENUM ('active', 'expiring', 'expired');
CREATE TYPE public.document_type AS ENUM ('commission', 'service', 'license');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.alert_type AS ENUM ('expiry', 'risk', 'update');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.change_type AS ENUM ('improvement', 'neutral', 'concern');

-- Create brands table for clustering
CREATE TABLE public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create series table for clustering phone models
CREATE TABLE public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id),
  series_id UUID REFERENCES public.series(id),
  model TEXT,
  version TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  status contract_status DEFAULT 'active',
  uploaded_by UUID REFERENCES auth.users(id),
  file_size TEXT,
  document_type document_type NOT NULL,
  risk_level risk_level DEFAULT 'medium',
  
  -- Key terms fields
  margin TEXT,
  payment_terms TEXT,
  sla_time TEXT,
  territory TEXT,
  exclusivity BOOLEAN DEFAULT false,
  minimum_order_quantity TEXT,
  warranty_period TEXT,
  
  -- Additional metadata
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contract versions table for tracking changes
CREATE TABLE public.contract_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(contract_id, version_number)
);

-- Create contract comparisons table
CREATE TABLE public.contract_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract1_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  contract2_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  comparison_date TIMESTAMPTZ DEFAULT NOW(),
  compared_by UUID REFERENCES auth.users(id),
  changes JSONB,
  summary TEXT
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  department TEXT,
  location TEXT,
  role TEXT DEFAULT 'salesperson',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brands (public read)
CREATE POLICY "Brands are viewable by everyone" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert brands" ON public.brands
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for series (public read)
CREATE POLICY "Series are viewable by everyone" ON public.series
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert series" ON public.series
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for contracts
CREATE POLICY "Users can view all contracts" ON public.contracts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their contracts" ON public.contracts
  FOR DELETE USING (auth.uid() = uploaded_by);

-- RLS Policies for contract versions
CREATE POLICY "Users can view contract versions" ON public.contract_versions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert contract versions" ON public.contract_versions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for comparisons
CREATE POLICY "Users can view comparisons" ON public.contract_comparisons
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comparisons" ON public.contract_comparisons
  FOR INSERT WITH CHECK (auth.uid() = compared_by);

-- RLS Policies for alerts
CREATE POLICY "Users can view their alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for brands and series
INSERT INTO public.brands (name) VALUES 
  ('Apple'),
  ('Samsung'),
  ('OnePlus'),
  ('Xiaomi'),
  ('Realme'),
  ('Oppo'),
  ('Vivo');

-- Insert sample series data
INSERT INTO public.series (brand_id, name, description) VALUES
  ((SELECT id FROM public.brands WHERE name = 'Apple'), 'iPhone 15', 'Latest flagship series'),
  ((SELECT id FROM public.brands WHERE name = 'Apple'), 'iPhone 14', 'Previous generation'),
  ((SELECT id FROM public.brands WHERE name = 'Samsung'), 'Galaxy S Series', 'Premium flagship phones'),
  ((SELECT id FROM public.brands WHERE name = 'Samsung'), 'Galaxy A Series', 'Mid-range phones'),
  ((SELECT id FROM public.brands WHERE name = 'Samsung'), 'Galaxy Z Series', 'Foldable phones'),
  ((SELECT id FROM public.brands WHERE name = 'OnePlus'), 'OnePlus 11', 'Flagship series'),
  ((SELECT id FROM public.brands WHERE name = 'OnePlus'), 'OnePlus Nord', 'Mid-range series'),
  ((SELECT id FROM public.brands WHERE name = 'Xiaomi'), 'Mi Series', 'Premium phones'),
  ((SELECT id FROM public.brands WHERE name = 'Xiaomi'), 'Redmi Note', 'Budget friendly series'),
  ((SELECT id FROM public.brands WHERE name = 'Realme'), 'Realme GT', 'Performance focused'),
  ((SELECT id FROM public.brands WHERE name = 'Realme'), 'Realme Number Series', 'Budget series'),
  ((SELECT id FROM public.brands WHERE name = 'Oppo'), 'Find Series', 'Premium flagship'),
  ((SELECT id FROM public.brands WHERE name = 'Oppo'), 'Reno Series', 'Camera focused'),
  ((SELECT id FROM public.brands WHERE name = 'Vivo'), 'X Series', 'Premium flagship'),
  ((SELECT id FROM public.brands WHERE name = 'Vivo'), 'V Series', 'Camera and design focused');