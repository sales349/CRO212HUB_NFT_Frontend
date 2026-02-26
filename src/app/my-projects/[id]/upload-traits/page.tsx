'use client';

import { useParams } from 'next/navigation';

export default function UploadTraitsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-foreground">Upload Traits</h1>
      <p className="mt-4 text-muted-foreground">
        Project ID: {projectId}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        (Phase 2 code being refactored)
      </p>
    </div>
  );
}