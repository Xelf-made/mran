-- Enable realtime on prescriptions table for live pharmacist + customer updates
ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;

-- Also ensure orders is in the realtime publication (may already be)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
