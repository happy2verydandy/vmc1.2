-- Create terms_agreement table for storing user consent history
CREATE TABLE IF NOT EXISTS terms_agreement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms_type VARCHAR(50) NOT NULL,
    agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_terms_agreement_updated_at 
    BEFORE UPDATE ON terms_agreement 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS terms_agreement_user_id_idx ON terms_agreement(user_id);
CREATE INDEX IF NOT EXISTS terms_agreement_terms_type_idx ON terms_agreement(terms_type);
CREATE INDEX IF NOT EXISTS terms_agreement_agreed_at_idx ON terms_agreement(agreed_at);