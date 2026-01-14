import { redirect } from "next/navigation";

export default function ViewerRedirect({ params }: { params: { id: string } }) {
  redirect(`/project/${params.id}`);
}
