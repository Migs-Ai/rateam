
-- Fix admin role assignment for the correct email
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user ID for the correct email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'lekanogundeji@gmail.com';
  
  -- Only proceed if user exists
  IF target_user_id IS NOT NULL THEN
    -- Delete any existing roles for this user first
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    
    RAISE NOTICE 'Admin role assigned to user: %', target_user_id;
  ELSE
    RAISE NOTICE 'User with email lekanogundeji@gmail.com not found';
  END IF;
END $$;
