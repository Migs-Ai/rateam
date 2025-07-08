-- Assign admin role to lekanogundeji@gmail.com
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID for the email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'lekanogundeji@gmail.com';
  
  -- Only proceed if user exists
  IF target_user_id IS NOT NULL THEN
    -- Insert admin role (handle case where role might already exist)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned to user: %', target_user_id;
  ELSE
    RAISE NOTICE 'User with email lekanogundeji@gmail.com not found';
  END IF;
END $$;