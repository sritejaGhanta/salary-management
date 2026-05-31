'use client';

import React from 'react';
import PortalLayout from '../../components/layout/portal-layout';

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}
