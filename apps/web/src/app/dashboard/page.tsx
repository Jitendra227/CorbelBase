import { redirect } from "next/navigation";

import { PATHS } from "@/config/paths";

export default function Page() {
  redirect(PATHS.organizations);
}
