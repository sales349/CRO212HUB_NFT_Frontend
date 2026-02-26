'use client';

export default function DeployPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-foreground">Deploy Contract</h1>
      <p className="mt-4 text-muted-foreground">
        Contract deployment will be available in Week 5 with viem integration.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        (Phase 2 ethers code removed — being rebuilt with viem)
      </p>
    </div>
  );
}