import type { Metadata } from "next";
import ProjectPage, { projectMetadata } from "@/components/ProjectPage";

export function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  return projectMetadata(params);
}

export default function Page({ params }: PageProps<"/projects/[id]">) {
  return <ProjectPage params={params} />;
}
