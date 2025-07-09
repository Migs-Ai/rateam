
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading, role } = useUserRole();

  console.log('Admin page - User:', user?.email);
  console.log('Admin page - Role:', role);
  console.log('Admin page - IsAdmin:', isAdmin);
  console.log('Admin page - Auth Loading:', authLoading);
  console.log('Admin page - Role Loading:', roleLoading);

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('User is not admin, showing access denied');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <p className="text-sm text-muted-foreground">Current role: {role || 'user'}</p>
          <p className="text-sm text-muted-foreground">User: {user.email}</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default Admin;
