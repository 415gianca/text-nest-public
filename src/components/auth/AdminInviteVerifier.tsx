
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

// Define the interface for admin invite verification response
interface AdminInviteVerification {
  is_valid: boolean;
  email: string;
}

interface AdminInviteVerifierProps {
  onVerified: (email: string, token: string) => void;
}

const AdminInviteVerifier = ({ onVerified }: AdminInviteVerifierProps) => {
  const [searchParams] = useSearchParams();
  
  // Check for admin invite token in URL
  useEffect(() => {
    const token = searchParams.get('admin_invite');
    if (token) {
      verifyAdminInvite(token);
    }
  }, [searchParams]);
  
  // Verify admin invite token
  const verifyAdminInvite = async (token: string) => {
    try {
      const { data, error } = await supabase
        .rpc('verify_admin_invite', { invite_token: token })
        .returns<AdminInviteVerification[]>();
      
      if (error) {
        console.error("Admin invite verification error:", error);
        toast.error("Invalid or expired admin invitation");
        return;
      }
      
      if (data && Array.isArray(data) && data.length > 0 && data[0].is_valid) {
        onVerified(data[0].email, token);
        toast.success("Admin invitation verified!");
      } else {
        toast.error("Invalid or expired admin invitation");
      }
    } catch (err) {
      console.error("Failed to verify admin invite:", err);
      toast.error("Failed to verify admin invitation");
    }
  };

  return null; // This is a non-visual component
};

export default AdminInviteVerifier;
