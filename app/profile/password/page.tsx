'use client';

import React from 'react';
import ChangePasswordTab from '@/components/profile/ChangePasswordTab';
import { withAuth } from '@/lib/withAuth';

function PasswordPage() {
  return (
    <div className="space-y-8">
      <ChangePasswordTab />
    </div>
  );
}

export default withAuth(PasswordPage);
