import { redirect } from 'next/navigation';

/**
 * Exercises no longer have a standalone list — they're managed inline within
 * their owning lesson (see /admin/lessons/[id]/edit) or challenge, the same
 * way units live inside a learning path rather than their own top-level page.
 */
export default function ExercisesPage() {
  redirect('/admin/lessons');
}
