import React from 'react';
import { Hero } from '../components/home/Hero';
import { ToolsSection } from '../components/home/ToolsSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { UserPoll } from '../components/home/UserPoll';
import { CTASection } from '../components/home/CTASection';

/**
 * Home page with all main sections
 */
export const Home = () => {
  return (
    <>
      <Hero />
      <ToolsSection />
      <FeaturesSection />
      <UserPoll />
      <CTASection />
    </>
  );
};