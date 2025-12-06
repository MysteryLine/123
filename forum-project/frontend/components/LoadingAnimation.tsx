'use client';

import { useLoading } from './LoadingContext';
import ParticleLoading from './ParticleLoading';

const LoadingAnimation = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return <ParticleLoading />;
};

export default LoadingAnimation;
