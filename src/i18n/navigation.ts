import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware versions of Next's navigation APIs: <Link href="/"> becomes /es or /en
export const { Link, usePathname } = createNavigation(routing);
