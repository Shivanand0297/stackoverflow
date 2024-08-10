import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function PageWrapper({ children }: Props) {
  return (
    <div className="container max-w-7xl p-4 md:p-8 bg-background">
      {children}
    </div>
  );
}
